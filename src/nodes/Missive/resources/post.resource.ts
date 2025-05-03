import {
  IExecuteFunctions,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import { IResourceHandler, baseUrl } from './base.resource';

export class PostResource implements IResourceHandler {
  async execute(
    this: IExecuteFunctions,
    i: number,
    operation: string,
    items: INodeExecutionData[],
    credentials: { apiToken: string }
  ): Promise<INodeExecutionData> {
    if (operation === 'create') {
      const html = this.getNodeParameter('html', i, '') as string;
      const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
        references?: string;
        conversation?: string;
        conversationSubject?: string;
        conversationColor?: string;
        team?: string;
        forceTeam?: boolean;
        organization?: string;
        addUsers?: string;
        addAssignees?: string;
        addSharedLabels?: string;
        removeSharedLabels?: string;
        addToInbox?: boolean;
        addToTeamInbox?: boolean;
        close?: boolean;
        reopen?: boolean;
        markAsUnread?: boolean;
        suppressNotifications?: boolean;
        system?: boolean;
        text?: string;
        markdown?: string;
        username?: string;
        username_icon?: string;
        conversation_icon?: string;
        notification?: { value: { title: string, body: string } };
      };
      
      const text = additionalFields.text || '';
      const markdown = additionalFields.markdown || '';
      
      // Check if at least one of the required content fields is provided
      if (!html && !text && !markdown && 
          (!this.getNodeParameter('attachments', i, { attachment: [] }) || 
           this.getNodeParameter('attachments.attachment', i, []).length === 0)) {
        throw new NodeOperationError(this.getNode(), 'At least one of HTML, text, markdown, or attachments must be provided', {
          itemIndex: i,
        });
      }
      
      const postData: any = {};
      
      // Add content fields if provided
      if (html) {
        postData.html = html;
      }
      
      if (text) {
        postData.text = text;
      }
      
      if (markdown) {
        postData.markdown = markdown;
      }
      
      // Add custom username fields
      const username = additionalFields.username || '';
      if (username) {
        postData.username = username;
      }
      
      const usernameIcon = additionalFields.username_icon || '';
      if (usernameIcon) {
        postData.username_icon = usernameIcon;
      }
      
      const conversationIcon = additionalFields.conversation_icon || '';
      if (conversationIcon) {
        postData.conversation_icon = conversationIcon;
      }
      
      // Add notification if provided
      const notification = additionalFields.notification?.value;
      if (notification) {
        postData.notification = {
          title: notification.title || '',
          body: notification.body || '',
        };
      }
      
      // Add additional fields if any
      if (additionalFields.references) {
        postData.references = additionalFields.references.split(',').map(ref => ref.trim());
      }
      
      if (additionalFields.conversation) {
        postData.conversation = additionalFields.conversation;
      }
      
      if (additionalFields.conversationSubject) {
        postData.conversation_subject = additionalFields.conversationSubject;
      }
      
      if (additionalFields.conversationColor) {
        postData.conversation_color = additionalFields.conversationColor;
      }
      
      if (additionalFields.team) {
        postData.team = additionalFields.team;
      }
      
      if (additionalFields.forceTeam !== undefined) {
        postData.force_team = additionalFields.forceTeam;
      }
      
      if (additionalFields.organization) {
        postData.organization = additionalFields.organization;
      }
      
      if (additionalFields.addUsers) {
        postData.add_users = additionalFields.addUsers.split(',').map(id => id.trim());
      }
      
      if (additionalFields.addAssignees) {
        postData.add_assignees = additionalFields.addAssignees.split(',').map(id => id.trim());
      }
      
      if (additionalFields.addSharedLabels) {
        postData.add_shared_labels = additionalFields.addSharedLabels.split(',').map(id => id.trim());
      }
      
      if (additionalFields.removeSharedLabels) {
        postData.remove_shared_labels = additionalFields.removeSharedLabels.split(',').map(id => id.trim());
      }
      
      if (additionalFields.addToInbox !== undefined) {
        postData.add_to_inbox = additionalFields.addToInbox;
      }
      
      if (additionalFields.addToTeamInbox !== undefined) {
        postData.add_to_team_inbox = additionalFields.addToTeamInbox;
      }
      
      if (additionalFields.close !== undefined) {
        postData.close = additionalFields.close;
      }
      
      if (additionalFields.reopen !== undefined) {
        postData.reopen = additionalFields.reopen;
      }
      
      if (additionalFields.markAsUnread !== undefined) {
        postData.mark_as_unread = additionalFields.markAsUnread;
      }
      
      if (additionalFields.suppressNotifications !== undefined) {
        postData.suppress_notifications = additionalFields.suppressNotifications;
      }
      
      if (additionalFields.system !== undefined) {
        postData.system = additionalFields.system;
      }
      
      // Handle attachments with all possible fields
      const attachmentItems = this.getNodeParameter('attachments.attachment', i, []) as Array<{
        binaryPropertyName: string;
        fileName: string;
        fields?: { field: Array<{ title: string; value: string; short: boolean }> };
        color?: string;
        pretext?: string;
        author_name?: string;
        author_link?: string;
        author_icon?: string;
        title?: string;
        title_link?: string;
        image_url?: string;
        text?: string;
        markdown?: string;
        timestamp?: number;
        footer?: string;
        footer_icon?: string;
      }>;
      
      if (attachmentItems && attachmentItems.length > 0) {
        const attachmentsData = [];
        
        for (const attachment of attachmentItems) {
          const attachmentData: any = {};
          
          // Handle file upload if binary property is provided
          if (attachment.binaryPropertyName) {
            const binaryData = this.helpers.assertBinaryData(i, attachment.binaryPropertyName);
            const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, attachment.binaryPropertyName);
            
            const fileName = attachment.fileName || binaryData.fileName || 'unknown';
            const mimeType = binaryData.mimeType || 'application/octet-stream';
            
            attachmentData.filename = fileName;
            attachmentData.content_type = mimeType;
            attachmentData.content = binaryDataBuffer.toString('base64');
          }
          
          // Add all the attachment metadata fields
          if (attachment.fields && attachment.fields.field) {
            attachmentData.fields = attachment.fields.field.map(field => ({
              title: field.title,
              value: field.value,
              short: field.short,
            }));
          }
          
          if (attachment.color) attachmentData.color = attachment.color;
          if (attachment.pretext) attachmentData.pretext = attachment.pretext;
          if (attachment.author_name) attachmentData.author_name = attachment.author_name;
          if (attachment.author_link) attachmentData.author_link = attachment.author_link;
          if (attachment.author_icon) attachmentData.author_icon = attachment.author_icon;
          if (attachment.title) attachmentData.title = attachment.title;
          if (attachment.title_link) attachmentData.title_link = attachment.title_link;
          if (attachment.image_url) attachmentData.image_url = attachment.image_url;
          if (attachment.text) attachmentData.text = attachment.text;
          if (attachment.markdown) attachmentData.markdown = attachment.markdown;
          if (attachment.timestamp) attachmentData.timestamp = attachment.timestamp;
          if (attachment.footer) attachmentData.footer = attachment.footer;
          if (attachment.footer_icon) attachmentData.footer_icon = attachment.footer_icon;
          
          attachmentsData.push(attachmentData);
        }
        
        if (attachmentsData.length > 0) {
          postData.attachments = attachmentsData;
        }
      }
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiToken}`,
        },
        uri: `${baseUrl}/posts`,
        body: { posts: postData },
        json: true,
      };
      
      const response = await this.helpers.request(options);
      return { json: response };
    }
    
    throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not supported.`);
  }
}