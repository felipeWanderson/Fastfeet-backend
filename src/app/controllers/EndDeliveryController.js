import * as Yup from 'yup';
import { startOfDay, parseISO, isBefore, setHours, isAfter } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import File from '../models/File';

class EndDeliveryController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number().required(),
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

    const { end_date, signature_id } = req.body;

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(401).json({ error: 'assinatura não existe' });
    }

    const date = parseISO(end_date);
    const hourStart = startOfDay(date);

    if (isBefore(hourStart, order.start_date)) {
      return res
        .status(400)
        .json({ error: 'data menor que a data do inicio da entrega' });
    }

    const eigth = setHours(hourStart, 5);
    const eigthteen = setHours(hourStart, 15);

    if (isBefore(date, eigth) || isAfter(date, eigthteen)) {
      return res
        .status(401)
        .json({ error: 'a entrega só poder ser entregue das 8h as 18h' });
    }

    if (order.canceled_at) {
      return res.status(400).json({ error: 'O pedido está cancelado' });
    }

    const { id, product, start_date } = await order.update(req.body);
    return res.json({
      id,
      product,
      start_date,
      end_date,
      signature_id,
    });
  }
}

export default new EndDeliveryController();
