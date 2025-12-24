declare module '@mailchimp/mailchimp_marketing' {
  interface Config {
    apiKey: string;
    server: string;
  }

  interface AddListMemberOptions {
    email_address: string;
    status: 'subscribed' | 'pending' | 'unsubscribed' | 'cleaned';
    merge_fields?: {
      FNAME?: string;
      LNAME?: string;
      [key: string]: any;
    };
    [key: string]: any;
  }

  interface ListMemberResponse {
    id: string;
    email_address: string;
    status: string;
    [key: string]: any;
  }

  interface MailchimpError extends Error {
    status?: number;
    response?: {
      body?: {
        title?: string;
        detail?: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
    [key: string]: any;
  }

  const mailchimp: {
    setConfig(config: Config): void;
    lists: {
      addListMember(listId: string, options: AddListMemberOptions): Promise<ListMemberResponse>;
      [key: string]: any;
    };
    [key: string]: any;
  };

  export default mailchimp;
}

