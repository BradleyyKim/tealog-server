import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tea-leaf.tea-leaf', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const response = await super.create(ctx);

    if (response.data) {
      await strapi.documents('api::tea-leaf.tea-leaf').update({
        documentId: response.data.documentId,
        data: { owner: user.id },
      });
    }

    return response;
  },

  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const entries = await strapi.documents('api::tea-leaf.tea-leaf').findMany({
      populate: ['cover_photo'],
      filters: { owner: user.id },
    });

    return { data: entries };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const entity = await strapi.documents('api::tea-leaf.tea-leaf').findOne({
      documentId: ctx.params.id,
      populate: ['owner', 'cover_photo'],
    });

    if (!entity || entity.owner?.id !== user.id) {
      return ctx.notFound('Resource not found');
    }

    return super.findOne(ctx);
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const entity = await strapi.documents('api::tea-leaf.tea-leaf').findOne({
      documentId: ctx.params.id,
      populate: ['owner'],
    });

    if (!entity || entity.owner?.id !== user.id) {
      return ctx.notFound('Resource not found');
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('You must be logged in');

    const entity = await strapi.documents('api::tea-leaf.tea-leaf').findOne({
      documentId: ctx.params.id,
      populate: ['owner'],
    });

    if (!entity || entity.owner?.id !== user.id) {
      return ctx.notFound('Resource not found');
    }

    return super.delete(ctx);
  },
}));
