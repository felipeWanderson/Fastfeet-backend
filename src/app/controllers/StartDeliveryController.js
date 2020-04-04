import * as Yup from 'yup';
import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  parseISO,
  isBefore,
  setHours,
  isAfter,
} from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

class StartDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.staus(400).json({ error: 'validação falhou' });
    }

    const { deliverymanId, orderId } = req.params;
    const deliveryman = await Deliveryman.findByPk(deliverymanId);
    if (!deliveryman) {
      return res.status(401).json({ error: 'entregador não existe' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(401).json({ error: 'pedido não existe não existe' });
    }

    const { start_date } = req.body;

    const date = parseISO(start_date);
    const hourStart = startOfDay(date);

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'essa data já passou' });
    }

    const checkAviability = await Order.findOne({
      where: {
        id: orderId,
        deliveryman_id: deliverymanId,
        canceled_at: null,
        start_date: date,
      },
    });

    if (checkAviability) {
      return res
        .status(400)
        .json({ error: 'a entrega ja inciciou nessa data' });
    }

    const eigth = setHours(hourStart, 5);
    const eigthteen = setHours(hourStart, 15);

    if (isBefore(date, eigth) || isAfter(date, eigthteen)) {
      return res
        .status(401)
        .json({ error: 'so pode retirar o pedido das 8h as 18h' });
    }

    const withdrawalCount = await Order.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    });

    if (withdrawalCount.length > 5) {
      return res.status(401).json('Você só pode retirar 5 pedidos por dia ');
    }

    await order.update(req.body);

    return res.json(order);
  }
}

export default new StartDeliveryController();
