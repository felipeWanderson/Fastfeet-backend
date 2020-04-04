import * as Yup from 'yup';
import DeliveryProblems from '../models/DeliveryProblems';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

import Queue from '../../lib/Queue';
import CancellationOrderMail from '../jobs/CancellationOrderMail';

class DeliveryProblemsController {
  async index(req, res) {
    const delivery = await DeliveryProblems.findAll();
    return res.json(delivery);
  }

  async show(req, res) {
    const { id } = req.params;

    const problem = await DeliveryProblems.findByPk(id);

    if (!problem) {
      return res.status(400).json({ error: 'o problema não existe' });
    }
    return res.json(problem);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'validação falhou' });
    }

    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(400).json({ error: 'pedido não existe' });
    }

    if (!order.start_date) {
      return res.status(401).json({ error: 'o pedido não foi retirado' });
    }

    if (order.end_date) {
      return res.status(401).json({ error: 'a entrega foi feita' });
    }

    if (order.canceled_at) {
      return res.status(401).json({ error: 'a entrega está cancelada' });
    }
    const { description } = req.body;

    const { id, delivery_id } = await DeliveryProblems.create({
      delivery_id: orderId,
      description,
    });

    return res.json({
      id,
      delivery_id,
      description,
    });
  }

  async delete(req, res) {
    const { problemId } = req.params;
    const problem = await DeliveryProblems.findByPk(problemId, {
      include: [
        {
          model: Order,
          attributes: ['start_date', 'end_date', 'canceled_at'],
        },
      ],
    });

    if (!problem) {
      return res.status(400).json({ error: 'problema não existe' });
    }

    const order = await Order.findByPk(problem.delivery_id, {
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
      ],
    });
    order.canceled_at = new Date();
    await order.save();
    await Queue.add(CancellationOrderMail.key, {
      problem,
      order,
    });
    return res.json(order);
  }
}

export default new DeliveryProblemsController();
