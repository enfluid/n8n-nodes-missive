import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { N8NPropertiesBuilder } from '@devlikeapro/n8n-openapi-node';
import * as doc from './openapi.json';

const parser = new N8NPropertiesBuilder(doc);
const properties = parser.build();

export class Missive implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Missive',
    name: 'missive',
    icon: 'file:missive.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with Missive API',
    defaults: {
      name: 'Missive',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'missiveApi',
        required: true,
      },
    ],
    requestDefaults: {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: '={{`Bearer ${$credentials.missiveApi.apiToken}`}}',
      },
      baseURL: 'https://public.missiveapp.com/v1',
    },
    properties: properties,
  };
}