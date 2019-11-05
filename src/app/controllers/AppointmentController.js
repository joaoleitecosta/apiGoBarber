import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/file';
import Notification from '../schemas/Notification';
import pt from 'date-fns/locale/pt-BR';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import * as Yup from 'yup';

class AppointmentController{

  async index(req, res) {
    const { page = 1, linePerPage = 2 } = req.query;
    const appointments =  await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: linePerPage,
      offset: (page - 1) * linePerPage,
      include: [
        {
         model: User,
         as: 'provider',
         attributes: ['id', 'name'],
         include: [
           {
             model: File,
             as: 'avatar',
             attributes: ['id', 'path', 'url'],
           },
         ],
        },
      ],
   });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validation fails'});
    }

    const { provider_id, date } = req.body;

    /**
     * check user is the same provider
     */
    if(provider_id == req.userId) {
      return res.status(401).json({ erro: "User cannot shedule with myself" });
    }
    /**
     * check if provider_id is a provider
     */
    const isProvider = await User.findOne({
       where: { id: provider_id, provider: true },
    });

    if(!isProvider) {
      return res.status(401).json({ error: 'you can only create appointments with providers' });
    }

    /**
     *check for past dates
     */
     const hourStart = startOfHour(parseISO(date));
     console.log(hourStart, date);

     if(isBefore(hourStart, new Date())) {
       return res.status(400).json({ error: 'Past dates are not permitted'});
     }

     /**
      * check date avaliability
      */
     const checkAvaliability = await Appointment.findOne({
       where: {
         provider_id,
         canceled_at: null,
         date: hourStart,
        },
     });

     if(checkAvaliability) {
       return res.status(400).json({ error: 'Appointment date not is available' });
     }

     const appointment = await Appointment.create({
       user_id: req.userId,
       provider_id,
       date,
    });

    /**
     * Notify appontment provider
     */

     const user = await User.findByPk(req.userId);
     const formattedDate = format(
       hourStart,
       "'dia' dd 'de' MMMM' às' H:mm'h'",
       {locale: pt}
     );

     await Notification.create({
       content: `Novo agendamento de ${user.name} para ${formattedDate}`,
       user: provider_id,
       read: false,
     });
    return res.json(appointment);
  }

  async delete(req, res) {
    const appontment = await Appointment.findByPk(req.params.id);

    if(appontment.user_id !== req.userId) {
      return res.status(401).json({
        erro: "You don't have permission to cancel this appontment."
      });
    }
      const dateWithSub = subHours(appontment.date, 2);

      if(isBefore(dateWithSub, new Date())) {
        return res.status(401).json({
         erro: 'You can only cancel appontments 2 hours advance.'
        });
      }

      appontment.canceled_at = new Date();

      await appontment.save();

      return res.json(appontment);

  }


}
export default new AppointmentController();
