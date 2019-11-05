import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProvidersController from './app/controllers/ProvidersController';
import AppointmentsController from  './app/controllers/AppointmentController';
import authMiddleware from './app/middlewares/auth';
import SheduleContoller from './app/controllers/SheduleContoller';
import NotificationController from './app/controllers/NotificationController';

import multer from 'multer';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProvidersController.index);

routes.get('/appointments', AppointmentsController.index);
routes.post('/appointments', AppointmentsController.store);
routes.delete('/appointments/:id', AppointmentsController.delete);

routes.get('/shedules', SheduleContoller.index);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);


export default routes;
