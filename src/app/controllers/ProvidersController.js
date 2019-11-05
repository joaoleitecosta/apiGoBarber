import User from '../models/User';
import File from '../models/file';

class ProvidersController{
   async index(req, res) {
     const provides = await User.findAll( {
       where: { provider: true },
       attributes: ['id', 'name', 'email', 'avatar_id'],
       include: [
         {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
         },
        ],
     });
     return res.json(provides);
   }
}
export default new ProvidersController();
