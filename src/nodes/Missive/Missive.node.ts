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
import { IResourceHandler } from './resources/base.resource';

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
            default: false,
            description: 'Whether to send this post as a system message (appears differently in the UI)',
          },
          {
            displayName: 'Custom Username',
            name: 'username',
            type: 'string',
            default: '',
            description: 'Name of the post author, used instead of the API token owner\'s name',
          },
          {
            displayName: 'Custom Username Icon',
            name: 'username_icon',
            type: 'string',
            default: '',
            description: 'URL to an image for the post author avatar',
            placeholder: 'https://example.com/avatar.png',
          },
          {
            displayName: 'Custom Conversation Icon',
            name: 'conversation_icon',
            type: 'string',
            default: '',
            description: 'URL to an image used as the icon in the conversation list',
            placeholder: 'https://example.com/icon.png',
          },
          {
            displayName: 'Text (Plain)',
            name: 'text',
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,
            },
            description: 'Plain text content of the post',
          },
          {
            displayName: 'Markdown',
            name: 'markdown',
            type: 'string',
            default: '',
            typeOptions: {
              rows: 4,
            },
            description: 'Markdown-formatted content of the post',
          },
          {
            displayName: 'Notification',
            name: 'notification',
            placeholder: 'Add Notification',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: false,
            },
            default: {},
            options: [
              {
                name: 'value',
                displayName: 'Notification',
                values: [
                  {
                    displayName: 'Title',
                    name: 'title',
                    type: 'string',
                    default: '',
                    description: 'Title of the notification',
                  },
                  {
                    displayName: 'Body',
                    name: 'body',
                    type: 'string',
                    default: '',
                    description: 'Body text of the notification',
                  },
                ],
              },
            ],
          },

          // Add other options for the post resource here
        ],
      },

      // CONVERSATION OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['conversation'],
          },
        },
        options: [
          {
            name: 'Get',
            value: 'get',
            description: 'Get a conversation',
            action: 'Get a conversation',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all conversations',
            action: 'Get all conversations',
          },
        ],
        default: 'get',
      },
      {
        displayName: 'Conversation ID',
        name: 'conversationId',
        type: 'string',
        required: true,
        displayOptions: {
          show: {
            operation: ['get'],
            resource: ['conversation'],
          },
        },
        default: '',
        description: 'ID of the conversation to retrieve',
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
          show: {
            operation: ['getAll'],
            resource: ['conversation'],
          },
        },
        options: [
          {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            default: 50,
            description: 'Max number of results to return',
          },
          {
            displayName: 'Offset',
            name: 'offset',
            type: 'number',
            default: 0,
            description: 'Offset for pagination',
          },
        ],
      },

      // CONTACT OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['contact'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new contact',
            action: 'Create a contact',
          },
          {
            name: 'Delete',
            value: 'delete',
            description: 'Delete a contact',
            action: 'Delete a contact',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a contact',
            action: 'Get a contact',
          },
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all contacts',
            action: 'Get all contacts',
          },
          {
            name: 'Update',
            value: 'update',
            description: 'Update a contact',
            action: 'Update a contact',
          },
        ],
        default: 'create',
      },
      // Add other properties for contact operations

      // CONTACT BOOK OPERATIONS 
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['contactBook'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all contact books',
            action: 'Get all contact books',
          },
        ],
        default: 'getAll',
      },
      
      // ORGANIZATION OPERATIONS
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['organization'],
          },
        },
        options: [
          {
            name: 'Get All',
            value: 'getAll',
            description: 'Get all organizations',
            action: 'Get all organizations',
          },
        ],
        default: 'getAll',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;
    
    // For all operations
    const credentials = await this.getCredentials('missiveApi') as { apiToken: string };
    
    // Initialize resource handlers
    const resourceHandlers: { [key: string]: IResourceHandler } = {
      'draft': new DraftResource(),
      'post': new PostResource(),
      'contact': new ContactResource(),
      'contactBook': new ContactBookResource(),
      'conversation': new ConversationResource(),
      'organization': new OrganizationResource(),
    };
    
    for (let i = 0; i < items.length; i++) {
      try {
        if (resourceHandlers[resource]) {
          const result = await resourceHandlers[resource].execute(
            this, i, operation, items, credentials
          );
          returnData.push(result);
        } else {
          throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not supported.`);
        }
      } catch (error: any) {
        if (this.continueOnFail()) {
          returnData.push({ json: { error: error.message } });
          continue;
        }
        throw error;
      }
    }
    
    return [returnData];
  }
}