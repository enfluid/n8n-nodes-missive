import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import { IResourceHandler, baseUrl } from './base.resource';

export class ContactResource implements IResourceHandler {
  async execute(
    this: IExecuteFunctions,
    i: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData> {
    if (operation === 'get') {
      const contactId = this.getNodeParameter('contactId', i) as string;
      
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/contacts/${contactId}`,
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    else if (operation === 'getAll') {
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
        contactBookId?: string;
        q?: string;
        limit?: number;
        offset?: number;
      };
      
      const qs: any = {};
      
      if (additionalFields.contactBookId) {
        qs.contact_book_id = additionalFields.contactBookId;
      }
      
      if (additionalFields.q) {
        qs.q = additionalFields.q;
      }
      
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
        uri: `${baseUrl}/contacts`,
        qs,
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    else if (operation === 'create') {
      const contactBookId = this.getNodeParameter('contactBookId', i) as string;
      const name = this.getNodeParameter('name', i, '') as string;
      const emailsString = this.getNodeParameter('emails', i, '') as string;
      
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
        phones?: string;
        websites?: string;
        company?: string;
        birthday?: string;
        description?: string;
      };
      
      const contactData: any = {
        contact_book_id: contactBookId,
      };
      
      if (name) {
        contactData.name = name;
      }
      
      if (emailsString) {
        contactData.emails = emailsString.split(',').map(email => email.trim());
      }
      
      if (additionalFields.phones) {
        contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());
      }
      
      if (additionalFields.websites) {
        contactData.websites = additionalFields.websites.split(',').map(website => website.trim());
      }
      
      if (additionalFields.company) {
        contactData.company = additionalFields.company;
      }
      
      if (additionalFields.birthday) {
        contactData.birthday = additionalFields.birthday;
      }
      
      if (additionalFields.description) {
        contactData.description = additionalFields.description;
      }
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/contacts`,
        body: { contacts: contactData },
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    else if (operation === 'update') {
      const contactId = this.getNodeParameter('contactId', i) as string;
      const contactBookId = this.getNodeParameter('contactBookId', i) as string;
      const name = this.getNodeParameter('name', i, '') as string;
      const emailsString = this.getNodeParameter('emails', i, '') as string;
      
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
        phones?: string;
        websites?: string;
        company?: string;
        birthday?: string;
        description?: string;
      };
      
      const contactData: any = {
        contact_book_id: contactBookId,
      };
      
      if (name) {
        contactData.name = name;
      }
      
      if (emailsString) {
        contactData.emails = emailsString.split(',').map(email => email.trim());
      }
      
      if (additionalFields.phones) {
        contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());
      }
      
      if (additionalFields.websites) {
        contactData.websites = additionalFields.websites.split(',').map(website => website.trim());
      }
      
      if (additionalFields.company) {
        contactData.company = additionalFields.company;
      }
      
      if (additionalFields.birthday) {
        contactData.birthday = additionalFields.birthday;
      }
      
      if (additionalFields.description) {
        contactData.description = additionalFields.description;
      }
      
      const options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/contacts/${contactId}`,
        body: { contacts: contactData },
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    else if (operation === 'delete') {
      const contactId = this.getNodeParameter('contactId', i) as string;
      
      const options = {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/contacts/${contactId}`,
        json: true,
      };
      
      await this.helpers.request(options);
      return { json: { success: true } };
    }
    
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported.`);
  }
}