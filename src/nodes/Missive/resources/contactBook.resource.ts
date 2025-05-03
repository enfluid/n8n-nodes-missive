import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import { IResourceHandler, baseUrl } from './base.resource';

export class ContactBookResource implements IResourceHandler {
  async execute(
    this: IExecuteFunctions,
    i: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData> {
    if (operation === 'getAll') {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/contact_books`,
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported.`);
  }
}