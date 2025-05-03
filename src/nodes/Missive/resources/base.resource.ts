import {
  IExecuteFunctions,
  INodeExecutionData,
} from 'n8n-workflow';

export interface IResourceHandler {
  execute(
    this: IExecuteFunctions,
    index: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData>;
}

export const baseUrl = 'https://public.missiveapp.com/v1';