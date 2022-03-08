import { List } from '@clerk/shared/components/list';
import { TitledCard } from '@clerk/shared/components/titledCard';
import { OAuthProvider, OAuthStrategy } from "@clerk/types";
import React, { useState } from 'react';
import { Error } from 'ui/common/error';
import { useCoreUser, useEnvironment } from 'ui/contexts';
import { useNavigate } from "ui/hooks";
import { PageHeading } from 'ui/userProfile/pageHeading';

import { ConnectedAccountListItem } from './ConnectedAccountListItem';
import { UnconnectedAccountListItem } from './UnconnectedAccountListItem';

export function ConnectedAccountList(): JSX.Element {
  return <>
    <PageHeading title='Connected accounts' backTo='../' />

    <TitledCard className='cl-themed-card cl-list-card'>
      <ConnectedAccountListRows/>
    </TitledCard>
  </>;
}

function ConnectedAccountListRows(): JSX.Element {
  const [error, setError] = useState<string | undefined>();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const { userSettings: { social } } = useEnvironment();

  const availableProviders = Object.values(social).filter(oauthProvider => oauthProvider.enabled);

  const connectedProviders = user.externalAccounts.map(externalAccount => externalAccount.provider);

  const unconnectedProviders = availableProviders.filter((oauthProvider) => {
    const provider = oauthProvider.strategy.replace('oauth_', '') as OAuthProvider; // :-(
    return !connectedProviders.includes(provider);
  });

  const handleConnect = (strategy: OAuthStrategy) => {
    setError(undefined);

    user.connectExternalAccount({ strategy: strategy, redirect_url: window.location.href })
      .then(verification => {
        navigate(verification.externalVerificationRedirectURL);
      }).catch(err => {
        setError(err.message || err);
        console.log(err);
    });
  }

  if (availableProviders.length == 0) {
    return (
      <div className='cl-empty-list-item'>
        There are no available external account providers
      </div>
    );
  }

  return <>
    <Error>{error}</Error>

    <List>
      {user.externalAccounts.map(externalAccount => (
        <ConnectedAccountListItem
          key={externalAccount.id}
          externalAccount={externalAccount}
        />
      ))}

      {unconnectedProviders.map(unconnectedProvider => (
        <UnconnectedAccountListItem
          key={unconnectedProvider.strategy}
          oauthProviderSettings={unconnectedProvider}
          handleConnect={handleConnect}
        />
      ))}
    </List>
  </>
}
