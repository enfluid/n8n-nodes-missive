import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class MissiveApi implements ICredentialType {
  name = 'missiveApi';
  displayName = 'Missive API';
  documentationUrl = 'https://learn.missiveapp.com/api-documentation/getting-started';
  properties: INodeProperties[] = [
    {
      displayName: 'API Token',
      name: 'apiToken',
      type: 'string',
      default: '',
      required: true,
      description: 'Get your API token from your Missive preferences in the API tab',
    },
  ];
}