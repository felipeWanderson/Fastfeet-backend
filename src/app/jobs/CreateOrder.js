import Mail from '../../lib/Mail';

class CreateOrder {
  get key() {
    return 'CreateOrder';
  }

  async handle({ data }) {
    const { deliveryman, order } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova Entrega Disponivel',
      template: 'order',
      context: {
        deliveryman: deliveryman.name,
        order: order.id,
        product: order.product,
      },
    });
  }
}

export default new CreateOrder();
