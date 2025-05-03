import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import { IResourceHandler, baseUrl } from './base.resource';

export class ConversationResource implements IResourceHandler {
  async execute(
    this: IExecuteFunctions,
    i: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData> {
    if (operation === 'get') {
      const conversationId = this.getNodeParameter('conversationId', i) as string;
      
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/conversations/${conversationId}`,
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    else if (operation === 'getAll') {
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
        limit?: number;
        offset?: number;
      };
      
      const qs: any = {};
      
      if (additionalFields.limit) {
        qs.limit = additionalFields.limit;
      }
      
      if (additionalFields.offset) {
        qs.offset = additionalFields.offset;
      }
      
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/conversations`,
        qs,
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported.`);
  }
}