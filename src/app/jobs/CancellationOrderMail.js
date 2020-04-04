import Mail from '../../lib/Mail';

class CancellationOrderMail {
  get key() {
    return 'CancellationOrderMail';
  }

  async handle({ data }) {
    const { problem, order } = data;

    await Mail.sendMail({
      to: `${order.deliveryman.name} <${order.deliveryman.email}>`,
      subject: 'Cancelamento da entrega',
      template: 'cancellation',
      context: {
        deliveryman: order.deliveryman.name,
        order: order.id,
        description: problem.description,
      },
    });
  }
}

export default new CancellationOrderMail();
