import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DeliveriesController from './app/controllers/DeliveriesController';
import DeliveredController from './app/controllers/DeliveredController';
import StartDeliveryController from './app/controllers/StartDeliveryController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveriesController.index);
routes.get('/deliveryman/:id/delivered', DeliveredController.index);
routes.put(
  '/deliveryman/:deliverymanId/order/:orderId/start-delivery',
  StartDeliveryController.update
);
routes.put(
  '/deliveryman/:deliverymanId/order/:orderId/end-delivery',
  EndDeliveryController.update
);

routes.post('/delivery/:orderId/problems', DeliveryProblemsController.store);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverymans', DeliverymanController.index);
routes.post('/deliverymans', DeliverymanController.store);
routes.put('/deliverymans/:id', DeliverymanController.update);
routes.delete('/deliverymans/:id', DeliverymanController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.get('/delivery/problems', DeliveryProblemsController.index);
routes.get('/delivery/:id/problems', DeliveryProblemsController.show);
routes.delete(
  '/problem/:problemId/cancel-delivery',
  DeliveryProblemsController.delete
);

export default routes;
