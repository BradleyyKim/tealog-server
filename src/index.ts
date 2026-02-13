import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const pluginStore = strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const isBootstrapped = await pluginStore.get({ key: 'tealog_bootstrapped_v3' });
    if (isBootstrapped) return;

    // Find the Authenticated role
    const authenticatedRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'authenticated' } });

    if (!authenticatedRole) return;

    // Content-type CRUD permissions
    const contentTypes = [
      'api::teaware.teaware',
      'api::tea-leaf.tea-leaf',
      'api::brew-log.brew-log',
    ];
    const crudActions = ['find', 'findOne', 'create', 'update', 'delete'];

    for (const ct of contentTypes) {
      for (const action of crudActions) {
        const fullAction = `${ct}.${action}`;
        await ensurePermission(strapi, authenticatedRole.id, fullAction);
      }
    }

    // Upload permissions (content-api)
    const uploadActions = [
      'plugin::upload.content-api.upload',
      'plugin::upload.content-api.find',
      'plugin::upload.content-api.findOne',
      'plugin::upload.content-api.destroy',
    ];

    for (const action of uploadActions) {
      await ensurePermission(strapi, authenticatedRole.id, action);
    }

    await pluginStore.set({ key: 'tealog_bootstrapped_v3', value: true });
    strapi.log.info('TeaLog: Authenticated role permissions configured (v3).');
  },
};

async function ensurePermission(
  strapi: Core.Strapi,
  roleId: number,
  action: string,
) {
  const permQuery = strapi.db.query('plugin::users-permissions.permission');

  const existing = await permQuery.findOne({
    where: { action, role: roleId },
  });

  if (!existing) {
    await permQuery.create({
      data: { action, role: roleId, enabled: true },
    });
    strapi.log.info(`  + Granted: ${action}`);
  }
}
