import {browserHistory} from 'react-router';
import React from 'react';

import {t} from '../../../locale';
import AsyncView from '../../asyncView';
import {Panel, PanelBody, PanelHeader} from '../../../components/panels';
import Button from '../../../components/buttons/button';
import Field from '../components/forms/field';
import getDynamicText from '../../../utils/getDynamicText';
import IndicatorStore from '../../../stores/indicatorStore';
import SettingsPageHeader from '../components/settingsPageHeader';
import TextBlock from '../components/text/textBlock';
import TextCopyInput from '../components/forms/textCopyInput';

import ServiceHookSettingsForm from './serviceHookSettingsForm';

export default class ProjectServiceHookDetails extends AsyncView {
  getEndpoints() {
    let {orgId, projectId, hookId} = this.props.params;
    return [['hook', `/projects/${orgId}/${projectId}/hooks/${hookId}/`]];
  }

  onDelete = () => {
    let {orgId, projectId, hookId} = this.props.params;
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));
    this.api.request(`/projects/${orgId}/${projectId}/hooks/${hookId}/`, {
      method: 'DELETE',
      success: () => {
        IndicatorStore.remove(loadingIndicator);
        browserHistory.push(`/settings/${orgId}/${projectId}/hooks/`);
      },
      error: () => {
        IndicatorStore.remove(loadingIndicator);
        IndicatorStore.add(
          t('Unable to remove application. Please try again.'),
          'error',
          {
            duration: 3000,
          }
        );
      },
    });
  };

  renderBody() {
    let {orgId, projectId, hookId} = this.props.params;
    let {hook} = this.state;
    return (
      <div>
        <SettingsPageHeader title={t('Service Hook Details')} />
        <ServiceHookSettingsForm
          {...this.props}
          orgId={orgId}
          projectId={projectId}
          hookId={hookId}
          initialData={{
            ...hook,
            isActive: hook.status != 'disabled',
          }}
        />
        <Panel>
          <PanelHeader>{t('Event Validation')}</PanelHeader>
          <PanelBody>
            <TextBlock>
              Sentry will send the <code>X-ServiceHook-Signature</code> header built using{' '}
              <code>HMAC(SHA256, [secret], [payload])</code>. You should always verify
              this signature before trusting the information provided in the webhook.
            </TextBlock>
            <Field
              label={t('Secret')}
              flexibleControlStateSize
              inline={false}
              help={t('The shared secret used for generating event HMAC signatures.')}
            >
              <TextCopyInput>
                {getDynamicText({
                  value: hook.secret,
                  fixed: 'a dynamic secret value',
                })}
              </TextCopyInput>
            </Field>
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader>{t('Delete Hook')}</PanelHeader>
          <PanelBody>
            <TextBlock>Removing this hook is immediate and permanent.</TextBlock>
            <Button priority="danger" onClick={this.onDelete}>
              Delete Hook
            </Button>
          </PanelBody>
        </Panel>
      </div>
    );
  }
}
