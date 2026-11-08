import { Client, type StompConfig } from '@stomp/stompjs';
import { tokenManager } from './token-manager';
export function createAuthenticatedStompClient(config: StompConfig): Client {
  const client = new Client(config);
  client.beforeConnect = async () => {
    if (config.beforeConnect) await config.beforeConnect(client);
    const token = tokenManager.getToken();
    client.connectHeaders = { ...config.connectHeaders, Authorization: `Bearer ${token || ''}` };
  };
  const unsubscribe = tokenManager.subscribe(() => {
    if (client.connected) client.forceDisconnect();
  });
  const deactivate = client.deactivate.bind(client);
  client.deactivate = async (options) => {
    unsubscribe();
    await deactivate(options);
  };
  return client;
}
