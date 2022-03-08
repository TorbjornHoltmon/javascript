import { renderJSON } from '@clerk/shared/testUtils';
import {
  ExternalAccountResource,
  UserResource,
  UserSettingsJSON,
  UserSettingsResource
} from '@clerk/types';
import { OAuthProviders } from "@clerk/types/src";
import { ExternalAccount } from 'core/resources/ExternalAccount';
import { UserSettings } from 'core/resources/UserSettings';
import React from 'react';

import { ConnectedAccountList } from './ConnectedAccountList';

const mockNavigate = jest.fn();
jest.mock('ui/hooks', () => ({
  useNavigate: () => {
    return {
      navigate: mockNavigate,
    };
  },
}));

const mockUseEnvironment = jest.fn();

jest.mock('ui/contexts', () => {
  return {
    useCoreUser: (): Partial<UserResource> => {
      return {
        id: 'user_1nQu4nZrhHEeolMMRhg4yERFYJx',
        username: null,
        firstName: 'Peter',
        lastName: 'Smith',
        externalAccounts: [
          new ExternalAccount({
            id: 'fbac_yolo',
            provider: 'facebook',
            approvedScopes: 'email',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            externalId: '10147951078263327',
          } as ExternalAccountResource),
          new ExternalAccount({
            id: 'gac_swag',
            provider: 'google',
            approvedScopes:
              'email https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid profile',
            emailAddress: 'peter@gmail.com',
            firstName: 'Peter',
            lastName: 'Smith',
            externalId: '112567347150540108741',
          } as ExternalAccountResource),
        ],
      };
    },
    useEnvironment: () => mockUseEnvironment(),
  };
});

const environmentContext = {
  userSettings: new UserSettings({
    social: {
      oauth_google: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
      oauth_facebook: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_facebook',
      },
      oauth_github: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_github',
      },
      oauth_microsoft: {
        enabled: true,
        required: false,
        authenticatable: true,
        strategy: 'oauth_microsoft',
      },
      oauth_bitbucket: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_bitbucket',
      },
      oauth_discord: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_bitbucket',
      }
    } as OAuthProviders,
  } as UserSettingsJSON) as UserSettingsResource,
};

const emptyEnvironmentContext = {
  userSettings: new UserSettings({
    social: {
      oauth_google: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_google',
      },
      oauth_facebook: {
        enabled: false,
        required: false,
        authenticatable: true,
        strategy: 'oauth_facebook',
      },
    } as OAuthProviders,
  } as UserSettingsJSON) as UserSettingsResource,
};

jest.mock('ui/router/RouteContext', () => {
  return {
    useRouter: () => {
      return {
        resolve: () => {
          return {
            toURL: {
              href: 'http://www.ssddd.com',
            },
          };
        },
      };
    },
  };
});

describe('<ConnectedAccountList/>', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a list of Connected Accounts', () => {
    mockUseEnvironment.mockImplementation(() => environmentContext);
    const tree = renderJSON(<ConnectedAccountList/>);
    expect(tree).toMatchSnapshot();
  });

  it('renders an empty list if there are no enabled providers', () => {
    mockUseEnvironment.mockImplementation(() => emptyEnvironmentContext);
    const tree = renderJSON(<ConnectedAccountList/>);
    expect(tree).toMatchSnapshot();
  });
});
