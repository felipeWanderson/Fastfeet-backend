import * as Yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import Queue from '../../lib/Queue';
import CreateOrder from '../jobs/CreateOrder';

class OrderController {
  async index(req, res) {
    const { page } = req.query;
    const orders = await Order.findAll({
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zipcode',
          ],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!schema) {
      return res.status(400).json({ error: 'Validação Falhou' });
    }

    const { deliveryman_id, recipient_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'entregador não existe' });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'endereço não existe' });
    }

    const order = await Order.create(req.body);
    const { id, product } = order;

    await Queue.add(CreateOrder.key, {
      deliveryman,
      order,
    });

    return res.json({ id, deliveryman_id, recipient_id, product });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number(),
      recipient_id: Yup.number(),
      product: Yup.string(),
    });

    if (!schema) {
      return res.status(400).json({ error: 'Validação Falhou' });
    }

    const { deliveryman_id, recipient_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'entregador não existe' });
    }

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient) {
      return res.status(400).json({ error: 'endereço não existe' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ err: 'Pedido não encontrado!' });
    }

    const { id } = await order.update(req.body);

    return res.json({ id, product, deliveryman_id, recipient_id });
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'O pedido não existe' });
    }
    await order.destroy();
    return res.json({ deleted: true });
  }
}

export default new OrderController();
