import { UserJSON } from '@clerk/types';
import { BaseResource, Verification } from 'core/resources/internal';

import {User} from './User';

describe('User', () => {

  it('connects an external account', async () => {
    // @ts-ignore
    BaseResource._fetch = jest.fn().mockReturnValue(Promise.resolve(new Verification({})));

    const user = new User({
      email_addresses: [],
      phone_numbers: [],
      web3_wallets: [],
      external_accounts: [],
    } as unknown as UserJSON);

    await user.connectExternalAccount({strategy: 'oauth_dropbox', redirect_url: 'https://www.example.com'});

    // @ts-ignore
    expect(BaseResource._fetch).toHaveBeenCalledWith({
      method: 'POST',
      path: '/me/external_accounts/connect',
      body:
        {
          redirect_url: 'https://www.example.com',
          strategy: 'oauth_dropbox',
        }
    });
  });

});
