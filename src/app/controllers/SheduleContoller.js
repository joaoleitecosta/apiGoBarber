import User from '../models/User';
import Appointment from '../models/Appointment';
import { startOfDay ,endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

class SheduleController {
  async index(req, res) {

    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true}
    });

    if(!isProvider) {
      return res.status(401).json({ error: 'User is not a provider'});
    }

    const { date, page = 1, linePerPage = 3 } = req.query;

    const presedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [
            startOfDay(presedDate),
            endOfDay(presedDate),
          ],
        },
       },
       limit: linePerPage,
       offset: ( page - 1) * linePerPage,
    });
    return res.json(appointments);
  }
}
export default new SheduleController();
