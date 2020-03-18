import * as Yup from 'yup';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
      product: Yup.number.required(),
    });

    if (!schema) {
      return res.status(400).json({ error: 'Validação Falhou' });
    }

    const { deliveryman_id, recipient_id } = req.body;

    const deliverymanExist = await Deliveryman.findByPk(deliveryman_id);

    if (!deliverymanExist) {
      return res.status(400).json({ error: 'entregador não existe' });
    }

    const recipientExist = await Recipient.findByPk(recipient_id);

    if (!recipientExist) {
      return res.status(400).json({ error: 'endereço não existe' });
    }

    const order = await Order.create(req.body);

    const { product } = order;

    return res.json({ deliveryman_id, recipient_id, product });
  }
}

export default new OrderController();
