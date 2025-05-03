import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

// Import resource handlers
import { DraftResource } from './resources/draft.resource';
import { PostResource } from './resources/post.resource';
import { ContactResource } from './resources/contact.resource';
import { ContactBookResource } from './resources/contactBook.resource';
import { ConversationResource } from './resources/conversation.resource';
import { OrganizationResource } from './resources/organization.resource';

export class Missive implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Missive',
    name: 'missive',
    icon: 'file:missive.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Work with the Missive API',
    defaults: {
      name: 'Missive',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'missiveApi',
        required: true,
      },
    ],
    properties: [
      // Resources
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Draft',
            value: 'draft',
          },
          {
            name: 'Post',
            value: 'post',
          },
          {
            name: 'Contact',
            value: 'contact',
          },
          {
            name: 'Contact Book',
            value: 'contactBook',
          },
          {
            name: 'Conversation',
            value: 'conversation',
          },
          {
            name: 'Organization',
            value: 'organization',
          },
        ],
        default: 'draft',
      },

      // DRAFT OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['draft'],
          },
        },
        options: [
          {
            name: 'Create Email',
            value: 'createEmail',
            description: 'Create a new email draft',
            action: 'Create an email draft',
          },
          {
            name: 'Create SMS & WhatsApp',
            value: 'createMessaging',
            description: 'Create a new SMS or WhatsApp message draft',
            action: 'Create an SMS or WhatsApp draft',
          },
        ],
        default: 'createEmail',
      },

      // Draft Create Email Fields
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Subject of the email',
      },
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'HTML body of the email',
      },
      {
        displayName: 'Send',
        name: 'send',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Whether to send the email immediately',
      },
      {
        displayName: 'Close',
        name: 'close',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Whether to close the conversation after sending',
      },
      {
        displayName: 'From Name',
        name: 'fromName',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Name of the sender',
      },
      {
        displayName: 'From Email',
        name: 'fromEmail',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        description: 'Email address of the sender',
      },
      {
        displayName: 'To',
        name: 'to',
        placeholder: 'Add To Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'CC',
        name: 'cc',
        placeholder: 'Add CC Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the CC recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the CC recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'BCC',
        name: 'bcc',
        placeholder: 'Add BCC Email',
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        default: {},
        options: [
          {
            name: 'emails',
            displayName: 'Emails',
            values: [
              {
                displayName: 'Name',
                name: 'name',
                type: 'string',
                default: '',
                description: 'Name of the BCC recipient',
              },
              {
                displayName: 'Email',
                name: 'address',
                type: 'string',
                placeholder: 'name@email.com',
                default: '',
                description: 'Email address of the BCC recipient',
              },
            ],
          },
        ],
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createEmail'],
          },
        },
        options: [
          {
            displayName: 'References',
            name: 'references',
            type: 'string',
            default: '',
            description: 'References for threading. Format: reference1,reference2',
            placeholder: 'ref1,ref2',
          },
          {
            displayName: 'Conversation ID',
            name: 'conversation',
            type: 'string',
            default: '',
            description: 'ID of the conversation to create the draft in',
          },
          {
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
          },
          {
            displayName: 'Team ID',
            name: 'team',
            type: 'string',
            default: '',
            description: 'ID of the team to link the draft\'s conversation to',
          },
          {
            displayName: 'Force Team',
            name: 'forceTeam',
            type: 'boolean',
            default: false,
            description: 'Force a new team even if the conversation is already in another team',
          },
          {
            displayName: 'Organization ID',
            name: 'organization',
            type: 'string',
            default: '',
            description: 'ID of the organization to scope the conversation to',
          },
          {
            displayName: 'Add Users',
            name: 'addUsers',
            type: 'string',
            default: '',
            description: 'User IDs to get access to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Assignees',
            name: 'addAssignees',
            type: 'string',
            default: '',
            description: 'User IDs to assign to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Schedule For',
            name: 'scheduleFor',
            type: 'dateTime',
            default: '',
            description: 'When to send the draft',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Auto Follow-up',
            name: 'autoFollowup',
            type: 'boolean',
            default: false,
            description: 'Enable auto follow-up for this message',
          },
          {
            displayName: 'Attachments',
            name: 'attachments',
            placeholder: 'Add Attachment',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'attachment',
                displayName: 'Attachment',
                values: [
                  {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the binary property containing the attachment data',
                  },
                  {
                    displayName: 'File Name',
                    name: 'fileName',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment file',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Draft Create SMS & WhatsApp Fields
      {
        displayName: 'Body',
        name: 'body',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Content of the message',
      },
      {
        displayName: 'Send',
        name: 'send',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Whether to send the message immediately',
      },
      {
        displayName: 'Close',
        name: 'close',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Whether to close the conversation after sending',
      },
      {
        displayName: 'From Phone Number',
        name: 'fromPhoneNumber',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Phone number to send from (e.g., +18005550199)',
        placeholder: '+18005550199',
      },
      {
        displayName: 'Message Type',
        name: 'messageType',
        type: 'options',
        options: [
          {
            name: 'SMS',
            value: '',
          },
          {
            name: 'WhatsApp',
            value: 'whatsapp',
          },
        ],
        default: '',
        required: false,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Type of message to send',
      },
      {
        displayName: 'To Phone Numbers',
        name: 'toPhoneNumbers',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        description: 'Phone numbers to send to. Use comma to separate multiple numbers.',
        placeholder: '+18005550199,+18005550200',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['draft'],
            operation: ['createMessaging'],
          },
        },
        options: [
          {
            displayName: 'References',
            name: 'references',
            type: 'string',
            default: '',
            description: 'References for threading. Format: reference1,reference2',
            placeholder: 'ref1,ref2',
          },
          {
            displayName: 'Conversation ID',
            name: 'conversation',
            type: 'string',
            default: '',
            description: 'ID of the conversation to create the draft in',
          },
          {
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
          },
          {
            displayName: 'Team ID',
            name: 'team',
            type: 'string',
            default: '',
            description: 'ID of the team to link the draft\'s conversation to',
          },
          {
            displayName: 'Force Team',
            name: 'forceTeam',
            type: 'boolean',
            default: false,
            description: 'Force a new team even if the conversation is already in another team',
          },
          {
            displayName: 'Organization ID',
            name: 'organization',
            type: 'string',
            default: '',
            description: 'ID of the organization to scope the conversation to',
          },
          {
            displayName: 'Add Users',
            name: 'addUsers',
            type: 'string',
            default: '',
            description: 'User IDs to get access to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Assignees',
            name: 'addAssignees',
            type: 'string',
            default: '',
            description: 'User IDs to assign to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Schedule For',
            name: 'scheduleFor',
            type: 'dateTime',
            default: '',
            description: 'When to send the draft',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Auto Follow-up',
            name: 'autoFollowup',
            type: 'boolean',
            default: false,
            description: 'Enable auto follow-up for this message',
          },
          {
            displayName: 'External Response ID',
            name: 'externalResponseId',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/messageType': ['whatsapp'],
              },
            },
            description: 'ID for WhatsApp template responses (only for WhatsApp)',
          },
          {
            displayName: 'External Response Variables',
            name: 'externalResponseVariables',
            type: 'string',
            default: '',
            displayOptions: {
              show: {
                '/messageType': ['whatsapp'],
              },
            },
            description: 'Variables for WhatsApp templates in JSON format (only for WhatsApp)',
            placeholder: '{"1":"Variable1","2":"Variable2"}',
          },
          {
            displayName: 'Attachments',
            name: 'attachments',
            placeholder: 'Add Attachment',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'attachment',
                displayName: 'Attachment',
                values: [
                  {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: 'data',
                    description: 'Name of the binary property containing the attachment data',
                  },
                  {
                    displayName: 'File Name',
                    name: 'fileName',
                    type: 'string',
                    default: '',
                    description: 'Name of the attachment file',
                  },
                ],
              },
            ],
          },
        ],
      },

      // POST OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['post'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new post',
            action: 'Create a post',
          },
        ],
        default: 'create',
      },

      // Post Create Fields
      {
        displayName: 'HTML Content',
        name: 'html',
        type: 'string',
        default: '',
        required: true,
        typeOptions: {
          rows: 4,
        },
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create'],
          },
        },
        description: 'HTML content of the post',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            resource: ['post'],
            operation: ['create'],
          },
        },
        options: [
          {
            displayName: 'References',
            name: 'references',
            type: 'string',
            default: '',
            description: 'References for threading. Format: reference1,reference2',
            placeholder: 'ref1,ref2',
          },
          {
            displayName: 'Conversation ID',
            name: 'conversation',
            type: 'string',
            default: '',
            description: 'ID of the conversation to create the post in',
          },
          {
            displayName: 'Conversation Subject',
            name: 'conversationSubject',
            type: 'string',
            default: '',
            description: 'Subject of the conversation (overwrites any existing subject)',
          },
          {
            displayName: 'Conversation Color',
            name: 'conversationColor',
            type: 'color',
            default: '',
            description: 'Color of the conversation (e.g. #FF0000 for red)',
          },
          {
            displayName: 'Team ID',
            name: 'team',
            type: 'string',
            default: '',
            description: 'ID of the team to link the post\'s conversation to',
          },
          {
            displayName: 'Force Team',
            name: 'forceTeam',
            type: 'boolean',
            default: false,
            description: 'Force a new team even if the conversation is already in another team',
          },
          {
            displayName: 'Organization ID',
            name: 'organization',
            type: 'string',
            default: '',
            description: 'ID of the organization to scope the conversation to',
          },
          {
            displayName: 'Add Users',
            name: 'addUsers',
            type: 'string',
            default: '',
            description: 'User IDs to get access to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Assignees',
            name: 'addAssignees',
            type: 'string',
            default: '',
            description: 'User IDs to assign to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Add Shared Labels',
            name: 'addSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to add to the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Remove Shared Labels',
            name: 'removeSharedLabels',
            type: 'string',
            default: '',
            description: 'Label IDs to remove from the conversation. Format: id1,id2',
            placeholder: 'id1,id2',
          },
          {
            displayName: 'Close Conversation',
            name: 'close',
            type: 'boolean',
            default: false,
            description: 'Whether to close the conversation after creating the post',
          },
          {
            displayName: 'Re-open Conversation',
            name: 'reopen',
            type: 'boolean',
            default: false,
            description: 'Whether to re-open the conversation if it was closed',
          },
          {
            displayName: 'Add to Inbox',
            name: 'addToInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the inbox',
          },
          {
            displayName: 'Add to Team Inbox',
            name: 'addToTeamInbox',
            type: 'boolean',
            default: false,
            description: 'Add the conversation to the team inbox',
          },
          {
            displayName: 'Mark as Unread',
            name: 'markAsUnread',
            type: 'boolean',
            default: false,
            description: 'Mark the conversation as unread for all its members',
          },
          {
            displayName: 'Suppress Notifications',
            name: 'suppressNotifications',
            type: 'boolean',
            default: false,
            description: 'Whether to suppress notifications for this post',
          },
          {
            displayName: 'Send as System Message',
            name: 'system',
            type: 'boolean',
            default: false, qs.limit = additionalFields.limit;
            description: 'Whether to send this post as a system message (appears differently in the UI)',}
          },
          {
            displayName: 'Custom Username', qs.offset = additionalFields.offset;
            name: 'username',}
            type: 'string',
            default: '',{
            description: 'Name of the post author, used instead of the API token owner\'s name',ET',
          },
          {'Authorization': `Bearer ${credentials.apiToken}`,
            displayName: 'Custom Username Icon',
            name: 'username_icon',: `${baseUrl}/conversations`,
            type: 'string',
            default: '',json: true,
            description: 'URL to an image for the post author avatar',};
            placeholder: 'https://example.com/avatar.png',
          },request(options);
          { returnData.push({ json: response });
            displayName: 'Custom Conversation Icon', }
            name: 'conversation_icon',}
            type: 'string',
            default: '',
            description: 'URL to an image used as the icon in the conversation list',anization') {
            placeholder: 'https://example.com/icon.png',
          },getAll') {
          {{
            displayName: 'Text (Plain)',ET',
            name: 'text',
            type: 'string','Authorization': `Bearer ${credentials.apiToken}`,
            default: '',
            typeOptions: {eUrl}/organizations`,
              rows: 4,json: true,
            },};
            description: 'Plain text content of the post',
          },request(options);
          { returnData.push({ json: response });
            displayName: 'Markdown', }
            name: 'markdown', }
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,a.push({ json: { error: error.message } });
            }, continue;
            description: 'Markdown-formatted content of the post',
          }, throw error;
          { }
            displayName: 'Notification',}
            name: 'notification',
            placeholder: 'Add Notification', return [returnData];
            type: 'fixedCollection', }






















































































































































































































































































































































































































































































































































































































































































































































































































































































































































}  }    return [returnData];        }      }        throw error;        }          continue;          returnData.push({ json: { error: error.message } });        if (this.continueOnFail()) {      catch (error: any) {      }        }          }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              uri: `${baseUrl}/organizations`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {          if (operation === 'getAll') {          // Get all organizations        else if (resource === 'organization') {        // ORGANIZATION RESOURCE                }          }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              qs,              uri: `${baseUrl}/conversations`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {                        }              qs.offset = additionalFields.offset;            if (additionalFields.offset) {                        }              qs.limit = additionalFields.limit;            if (additionalFields.limit) {                        const qs: any = {};                        };              offset?: number;              limit?: number;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {          else if (operation === 'getAll') {          // Get all conversations                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              uri: `${baseUrl}/conversations/${conversationId}`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {                        const conversationId = this.getNodeParameter('conversationId', i) as string;          if (operation === 'get') {          // Get a conversation        else if (resource === 'conversation') {        // CONVERSATION RESOURCE                }          }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              uri: `${baseUrl}/contact_books`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {          if (operation === 'getAll') {          // Get all contact books        else if (resource === 'contactBook') {        // CONTACT BOOK RESOURCE                }          }            returnData.push({ json: { success: true } });            await this.helpers.request(options);                        };              json: true,              uri: `${baseUrl}/contacts/${contactId}`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'DELETE',            const options = {                        const contactId = this.getNodeParameter('contactId', i) as string;          else if (operation === 'delete') {          // Delete a contact                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              body: { contacts: contactData },              uri: `${baseUrl}/contacts/${contactId}`,              },                'Authorization': `Bearer ${credentials.apiToken}`,                'Content-Type': 'application/json',              headers: {              method: 'PUT',            const options = {                        }              contactData.description = additionalFields.description;            if (additionalFields.description) {                        }              contactData.birthday = additionalFields.birthday;            if (additionalFields.birthday) {                        }              contactData.company = additionalFields.company;            if (additionalFields.company) {                        }              contactData.websites = additionalFields.websites.split(',').map(website => website.trim());            if (additionalFields.websites) {                        }              contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());            if (additionalFields.phones) {                        }              contactData.emails = emailsString.split(',').map(email => email.trim());            if (emailsString) {                        }              contactData.name = name;            if (name) {                        };              contact_book_id: contactBookId,            const contactData: any = {                        };              description?: string;              birthday?: string;              company?: string;              websites?: string;              phones?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {                        const emailsString = this.getNodeParameter('emails', i, '') as string;            const name = this.getNodeParameter('name', i, '') as string;            const contactBookId = this.getNodeParameter('contactBookId', i) as string;            const contactId = this.getNodeParameter('contactId', i) as string;          else if (operation === 'update') {          // Update a contact                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              body: { contacts: contactData },              uri: `${baseUrl}/contacts`,              },                'Authorization': `Bearer ${credentials.apiToken}`,                'Content-Type': 'application/json',              headers: {              method: 'POST',            const options = {                        }              contactData.description = additionalFields.description;            if (additionalFields.description) {                        }              contactData.birthday = additionalFields.birthday;            if (additionalFields.birthday) {                        }              contactData.company = additionalFields.company;            if (additionalFields.company) {                        }              contactData.websites = additionalFields.websites.split(',').map(website => website.trim());            if (additionalFields.websites) {                        }              contactData.phones = additionalFields.phones.split(',').map(phone => phone.trim());            if (additionalFields.phones) {                        }              contactData.emails = emailsString.split(',').map(email => email.trim());            if (emailsString) {                        }              contactData.name = name;            if (name) {                        };              contact_book_id: contactBookId,            const contactData: any = {                        };              description?: string;              birthday?: string;              company?: string;              websites?: string;              phones?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {                        const emailsString = this.getNodeParameter('emails', i, '') as string;            const name = this.getNodeParameter('name', i, '') as string;            const contactBookId = this.getNodeParameter('contactBookId', i) as string;          else if (operation === 'create') {          // Create a contact                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              qs,              uri: `${baseUrl}/contacts`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {                        }              qs.offset = additionalFields.offset;            if (additionalFields.offset) {                        }              qs.limit = additionalFields.limit;            if (additionalFields.limit) {                        }              qs.q = additionalFields.q;            if (additionalFields.q) {                        }              qs.contact_book_id = additionalFields.contactBookId;            if (additionalFields.contactBookId) {                        const qs: any = {};                        };              offset?: number;              limit?: number;              q?: string;              contactBookId?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {          else if (operation === 'getAll') {          // Get all contacts                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              uri: `${baseUrl}/contacts/${contactId}`,              },                'Authorization': `Bearer ${credentials.apiToken}`,              headers: {              method: 'GET',            const options = {                        const contactId = this.getNodeParameter('contactId', i) as string;          if (operation === 'get') {          // Get a contact        else if (resource === 'contact') {        // CONTACT RESOURCE                }          }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              body: { posts: postData },              uri: `${baseUrl}/posts`,              },                'Authorization': `Bearer ${credentials.apiToken}`,                'Content-Type': 'application/json',              headers: {              method: 'POST',            const options = {                        }              }                postData.attachments = attachmentsData;              if (attachmentsData.length > 0) {                            }                attachmentsData.push(attachmentData);                                if (attachment.footer_icon) attachmentData.footer_icon = attachment.footer_icon;                if (attachment.footer) attachmentData.footer = attachment.footer;                if (attachment.timestamp) attachmentData.timestamp = attachment.timestamp;                if (attachment.markdown) attachmentData.markdown = attachment.markdown;                if (attachment.text) attachmentData.text = attachment.text;                if (attachment.image_url) attachmentData.image_url = attachment.image_url;                if (attachment.title_link) attachmentData.title_link = attachment.title_link;                if (attachment.title) attachmentData.title = attachment.title;                if (attachment.author_icon) attachmentData.author_icon = attachment.author_icon;                if (attachment.author_link) attachmentData.author_link = attachment.author_link;                if (attachment.author_name) attachmentData.author_name = attachment.author_name;                if (attachment.pretext) attachmentData.pretext = attachment.pretext;                if (attachment.color) attachmentData.color = attachment.color;                                }                  }));                    short: field.short,                    value: field.value,                    title: field.title,                  attachmentData.fields = attachment.fields.field.map(field => ({                if (attachment.fields && attachment.fields.field) {                // Add all the attachment metadata fields                                }                  attachmentData.content = binaryDataBuffer.toString('base64');                  attachmentData.content_type = mimeType;                  attachmentData.filename = fileName;                                    const mimeType = binaryData.mimeType || 'application/octet-stream';                  const fileName = attachment.fileName || binaryData.fileName || 'unknown';                                    const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);                  const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);                if (attachment.binaryPropertyName) {                // Handle file upload if binary property is provided                                const attachmentData: any = {};              for (const attachment of attachmentItems) {                            const attachmentsData = [];            if (attachmentItems && attachmentItems.length > 0) {                        }>;              footer_icon?: string;              footer?: string;              timestamp?: number;              markdown?: string;              text?: string;              image_url?: string;              title_link?: string;              title?: string;              author_icon?: string;              author_link?: string;              author_name?: string;              pretext?: string;              color?: string;              fields?: { field: Array<{ title: string; value: string; short: boolean }> };              fileName: string;              binaryPropertyName: string;            const attachmentItems = this.getNodeParameter('attachments.attachment', i, []) as Array<{            // Handle attachments with all possible fields                        }              postData.system = additionalFields.system;            if (additionalFields.system !== undefined) {                        }              postData.suppress_notifications = additionalFields.suppressNotifications;            if (additionalFields.suppressNotifications !== undefined) {                        }              postData.mark_as_unread = additionalFields.markAsUnread;            if (additionalFields.markAsUnread !== undefined) {                        }              postData.reopen = additionalFields.reopen;            if (additionalFields.reopen !== undefined) {                        }              postData.close = additionalFields.close;            if (additionalFields.close !== undefined) {                        }              postData.add_to_team_inbox = additionalFields.addToTeamInbox;            if (additionalFields.addToTeamInbox !== undefined) {                        }              postData.add_to_inbox = additionalFields.addToInbox;            if (additionalFields.addToInbox !== undefined) {                        }              postData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());            if (additionalFields.removeSharedLabels) {                        }              postData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());            if (additionalFields.addSharedLabels) {                        }              postData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());            if (additionalFields.addAssignees) {                        }              postData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());            if (additionalFields.addUsers) {                        }              postData.organization = additionalFields.organization;            if (additionalFields.organization) {                        }              postData.force_team = additionalFields.forceTeam;            if (additionalFields.forceTeam !== undefined) {                        }              postData.team = additionalFields.team;            if (additionalFields.team) {                        }              postData.conversation_color = additionalFields.conversationColor;            if (additionalFields.conversationColor) {                        }              postData.conversation_subject = additionalFields.conversationSubject;            if (additionalFields.conversationSubject) {                        }              postData.conversation = additionalFields.conversation;            if (additionalFields.conversation) {                        }              postData.references = additionalFields.references.split(',').map(ref => ref.trim());            if (additionalFields.references) {            // Add additional fields if any                        }              };                body: notification.body || '',                title: notification.title || '',              postData.notification = {            if (notification) {                        } | null;              body?: string;              title?: string;            const notification = this.getNodeParameter('notification.value', i, null) as {            // Add notification if provided                        }              postData.conversation_icon = conversationIcon;            if (conversationIcon) {            const conversationIcon = this.getNodeParameter('conversation_icon', i, '') as string;                        }              postData.username_icon = usernameIcon;            if (usernameIcon) {            const usernameIcon = this.getNodeParameter('username_icon', i, '') as string;                        }              postData.username = username;            if (username) {            const username = this.getNodeParameter('username', i, '') as string;            // Add custom username fields                        }              postData.markdown = markdown;            if (markdown) {                        }              postData.text = text;            if (text) {                        }              postData.html = html;            if (html) {            // Add content fields if provided                        const postData: any = {};                        };              system?: boolean;              suppressNotifications?: boolean;              markAsUnread?: boolean;              reopen?: boolean;              close?: boolean;              addToTeamInbox?: boolean;              addToInbox?: boolean;              removeSharedLabels?: string;              addSharedLabels?: string;              addAssignees?: string;              addUsers?: string;              organization?: string;              forceTeam?: boolean;              team?: string;              conversationColor?: string;              conversationSubject?: string;              conversation?: string;              references?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {                        }              });                itemIndex: i,              throw new NodeOperationError(this.getNode(), 'At least one of HTML, text, markdown, or attachments must be provided', {                 this.getNodeParameter('attachments.attachment', i, []).length === 0)) {                (!this.getNodeParameter('attachments', i, { attachment: [] }) ||             if (!html && !text && !markdown &&             // Check if at least one of the required content fields is provided                        const markdown = this.getNodeParameter('markdown', i, '') as string;            const text = this.getNodeParameter('text', i, '') as string;            const html = this.getNodeParameter('html', i, '') as string;          if (operation === 'create') {          // Create a post        else if (resource === 'post') {        // POST RESOURCE                }          }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              body: { drafts: draftData },              uri: `${baseUrl}/drafts`,              },                'Authorization': `Bearer ${credentials.apiToken}`,                'Content-Type': 'application/json',              headers: {              method: 'POST',            const options = {                        }              }                draftData.attachments = attachmentsData;              if (attachmentsData.length > 0) {                            }                });                  content: binaryDataBuffer.toString('base64'),                  content_type: mimeType,                  filename: fileName,                attachmentsData.push({                                const mimeType = binaryData.mimeType || 'application/octet-stream';                const fileName = attachment.fileName || binaryData.fileName || 'unknown';                                const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);                const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);              for (const attachment of additionalFields.attachments.attachment) {                            const attachmentsData = [];            if (additionalFields.attachments && additionalFields.attachments.attachment) {            // Handle attachments if any                        }              }                }                  });                    itemIndex: i,                  throw new NodeOperationError(this.getNode(), 'Invalid JSON in External Response Variables', {                } catch (error) {                  draftData.external_response_variables = JSON.parse(additionalFields.externalResponseVariables);                  // Parse JSON string to object                try {              if (additionalFields.externalResponseVariables) {                            }                draftData.external_response_id = additionalFields.externalResponseId;              if (additionalFields.externalResponseId) {            if (messageType === 'whatsapp') {            // Add WhatsApp specific fields                        }              draftData.auto_followup = additionalFields.autoFollowup;            if (additionalFields.autoFollowup !== undefined) {                        }              draftData.add_to_team_inbox = additionalFields.addToTeamInbox;            if (additionalFields.addToTeamInbox !== undefined) {                        }              draftData.add_to_inbox = additionalFields.addToInbox;            if (additionalFields.addToInbox !== undefined) {                        }              draftData.schedule_for = additionalFields.scheduleFor;            if (additionalFields.scheduleFor) {                        }              draftData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());            if (additionalFields.removeSharedLabels) {                        }              draftData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());            if (additionalFields.addSharedLabels) {                        }              draftData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());            if (additionalFields.addAssignees) {                        }              draftData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());            if (additionalFields.addUsers) {                        }              draftData.organization = additionalFields.organization;            if (additionalFields.organization) {                        }              draftData.force_team = additionalFields.forceTeam;            if (additionalFields.forceTeam !== undefined) {                        }              draftData.team = additionalFields.team;            if (additionalFields.team) {                        }              draftData.conversation_color = additionalFields.conversationColor;            if (additionalFields.conversationColor) {                        }              draftData.conversation_subject = additionalFields.conversationSubject;            if (additionalFields.conversationSubject) {                        }              draftData.conversation = additionalFields.conversation;            if (additionalFields.conversation) {                        }              draftData.references = additionalFields.references.split(',').map(ref => ref.trim());            if (additionalFields.references) {            // Add additional fields if any                        draftData.to_fields = toPhoneNumbers.map(phoneNumber => ({ phone_number: phoneNumber }));            const toPhoneNumbers = toPhoneNumbersString.split(',').map(number => number.trim());            // Set to field for SMS/WhatsApp                        };              type: messageType,              phone_number: fromPhoneNumber,            draftData.from_field = {            // Set from field for SMS/WhatsApp                        };              close,              send,              body,            const draftData: any = {                        };              attachments?: { attachment: Array<{ binaryPropertyName: string, fileName: string }> };              externalResponseVariables?: string;              externalResponseId?: string;              autoFollowup?: boolean;              addToTeamInbox?: boolean;              addToInbox?: boolean;              scheduleFor?: string;              removeSharedLabels?: string;              addSharedLabels?: string;              addAssignees?: string;              addUsers?: string;              organization?: string;              forceTeam?: boolean;              team?: string;              conversationColor?: string;              conversationSubject?: string;              conversation?: string;              references?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {                        const toPhoneNumbersString = this.getNodeParameter('toPhoneNumbers', i) as string;            const messageType = this.getNodeParameter('messageType', i) as string;            const fromPhoneNumber = this.getNodeParameter('fromPhoneNumber', i) as string;            const close = this.getNodeParameter('close', i, false) as boolean;            const send = this.getNodeParameter('send', i, false) as boolean;            const body = this.getNodeParameter('body', i) as string;          else if (operation === 'createMessaging') {          // Create SMS & WhatsApp                    }            returnData.push({ json: response });            const response = await this.helpers.request(options);                        };              json: true,              body: { drafts: draftData },              uri: `${baseUrl}/drafts`,              },                'Authorization': `Bearer ${credentials.apiToken}`,                'Content-Type': 'application/json',              headers: {              method: 'POST',            const options = {                        }              }                draftData.attachments = attachmentsData;              if (attachmentsData.length > 0) {                            }                });                  content: binaryDataBuffer.toString('base64'),                  content_type: mimeType,                  filename: fileName,                attachmentsData.push({                                const mimeType = binaryData.mimeType || 'application/octet-stream';                const fileName = attachment.fileName || binaryData.fileName || 'unknown';                                const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);                const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);              for (const attachment of additionalFields.attachments.attachment) {                            const attachmentsData = [];            if (additionalFields.attachments && additionalFields.attachments.attachment) {            // Handle attachments if any                        }              draftData.auto_followup = additionalFields.autoFollowup;            if (additionalFields.autoFollowup !== undefined) {                        }              draftData.add_to_team_inbox = additionalFields.addToTeamInbox;            if (additionalFields.addToTeamInbox !== undefined) {                        }              draftData.add_to_inbox = additionalFields.addToInbox;            if (additionalFields.addToInbox !== undefined) {                        }              draftData.schedule_for = additionalFields.scheduleFor;            if (additionalFields.scheduleFor) {                        }              draftData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());            if (additionalFields.removeSharedLabels) {                        }              draftData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());            if (additionalFields.addSharedLabels) {                        }              draftData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());            if (additionalFields.addAssignees) {                        }              draftData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());            if (additionalFields.addUsers) {                        }              draftData.organization = additionalFields.organization;            if (additionalFields.organization) {                        }              draftData.force_team = additionalFields.forceTeam;            if (additionalFields.forceTeam !== undefined) {                        }              draftData.team = additionalFields.team;            if (additionalFields.team) {                        }              draftData.conversation_color = additionalFields.conversationColor;            if (additionalFields.conversationColor) {                        }              draftData.conversation_subject = additionalFields.conversationSubject;            if (additionalFields.conversationSubject) {                        }              draftData.conversation = additionalFields.conversation;            if (additionalFields.conversation) {                        }              draftData.references = additionalFields.references.split(',').map(ref => ref.trim());            if (additionalFields.references) {            // Add additional fields if any                        }              draftData.bcc_field = bccData;            if (bccData && bccData.length > 0) {                        }              draftData.cc_field = ccData;            if (ccData && ccData.length > 0) {                        }              draftData.to_fields = toData;            if (toData && toData.length > 0) {            // Add to, cc, bcc recipients if any                        }              if (fromEmail) draftData.from_field.address = fromEmail;              if (fromName) draftData.from_field.name = fromName;              draftData.from_field = {};            if (fromName || fromEmail) {            // Set from information if provided                        };              close,              send,              body,              subject,            const draftData: any = {                        };              attachments?: { attachment: Array<{ binaryPropertyName: string, fileName: string }> };              autoFollowup?: boolean;              addToTeamInbox?: boolean;              addToInbox?: boolean;              scheduleFor?: string;              removeSharedLabels?: string;              addSharedLabels?: string;              addAssignees?: string;              addUsers?: string;              organization?: string;              forceTeam?: boolean;              team?: string;              conversationColor?: string;              conversationSubject?: string;              conversation?: string;              references?: string;            const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {                        const bccData = this.getNodeParameter('bcc.emails', i, []) as Array<{ name: string, address: string }>;            const ccData = this.getNodeParameter('cc.emails', i, []) as Array<{ name: string, address: string }>;            const toData = this.getNodeParameter('to.emails', i, []) as Array<{ name: string, address: string }>;                        const fromEmail = this.getNodeParameter('fromEmail', i, '') as string;            const fromName = this.getNodeParameter('fromName', i, '') as string;            const close = this.getNodeParameter('close', i, false) as boolean;            const send = this.getNodeParameter('send', i, false) as boolean;            const body = this.getNodeParameter('body', i) as string;            const subject = this.getNodeParameter('subject', i) as string;          if (operation === 'createEmail') {          // Create Email        if (resource === 'draft') {        // DRAFT RESOURCE      try {    for (let i = 0; i < items.length; i++) {        const baseUrl = 'https://public.missiveapp.com/v1';    const credentials = await this.getCredentials('missiveApi') as { apiToken: string };    // For all operations        const operation = this.getNodeParameter('operation', 0) as string;    const resource = this.getNodeParameter('resource', 0) as string;    const returnData: INodeExecutionData[] = [];    const items = this.getInputData();  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {  };    ],      ...OrganizationResource,      // ORGANIZATION OPERATIONS      ...ConversationResource,      // CONVERSATION OPERATIONS      ...ContactBookResource,      // CONTACT BOOK OPERATIONS      ...ContactResource,      // CONTACT OPERATIONS      },        ],          },            ],              },                ],                  },                    description: 'Body text of the notification',                    default: '',                    type: 'string',                    name: 'body',                    displayName: 'Body',                  {                  },                    description: 'Title of the notification',                    default: '',                    type: 'string',                    name: 'title',                    displayName: 'Title',                  {                values: [                displayName: 'Notification',                name: 'value',              {            options: [            default: {},}