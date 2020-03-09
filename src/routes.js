import { Router } from 'express';

import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Felipe Leal',
    email: 'felipe2@fastfeet.com',
    password_hash: '121212121212',
  });

  return res.json(user);
});

export default routes;
