import { describe, expect, it } from 'vitest';
import { containsWorkflowSecret } from './workflow-secret-scanner';

const credentialExamples = [
  '-----BEGIN PRIVATE KEY-----',
  '-----begin rsa private key-----',
  `AKIA${'A'.repeat(16)}`,
  `ASIA${'A'.repeat(16)}`,
  `AIza${'A'.repeat(35)}`,
  `sk-${'a'.repeat(16)}`,
  `sk-proj-${'b'.repeat(16)}`,
  `sk-ant-api03-${'c'.repeat(16)}`,
  `sk_live_${'D'.repeat(16)}`,
  `rk_test_${'E'.repeat(16)}`,
  `whsec_${'W'.repeat(16)}`,
  `xoxb-${'F'.repeat(32)}`,
  `SG.${'G'.repeat(22)}.${'H'.repeat(43)}`,
  `SK${'0123456789abcdef'.repeat(2)}`,
  `glpat-${'I'.repeat(16)}`,
  `hf_${'J'.repeat(20)}`,
  `ghp_${'K'.repeat(16)}`,
  `github_pat_${'L'.repeat(16)}`,
  `Bearer ${'m'.repeat(12)}`,
  `eyJ${'N'.repeat(8)}.${'O'.repeat(4)}.${'P'.repeat(4)}`,
] as const;

const sensitiveValueExamples = [
  'api_key: supplied-value',
  'apikey: supplied-value',
  'access-token: supplied-value',
  'auth_token: supplied-value',
  'refresh_token: supplied-value',
  'webhook_secret: supplied-value',
  'secret_key: supplied-value',
  'private_key: supplied-value',
  'aws_access_key_id: supplied-value',
  'aws_secret_access_key: supplied-value',
  'aws_security_token: supplied-value',
  'aws_session_token: supplied-value',
  'authorization: Basic supplied-value',
  'client secret: supplied-value',
  'credential: supplied-value',
  'credentials: supplied-value',
  'password: supplied-value',
  'secret: supplied-value',
  'token: supplied-value',
  '{api_key: supplied-value}',
  '{safe: true, token: supplied-value}',
  'api_key:\n  value: supplied-value',
  'variable: api_key\nvalue: supplied-value',
  '- variable: API-Key\n  value: supplied-value',
  'name: access_token\ndefault_value: supplied-value',
  'default: supplied-value\nname: secret',
  'api_key: ${API_KEY}actual-secret',
  'api_key: "{{ api_key }}actual-secret"',
  'api_key: your_api_key_actual_secret',
  'api_key: change_me_before_use_actual_secret',
  'api_key: <api_key>actual-secret',
  '{api_key: ${API_KEY}actual-secret}',
  'variable: refresh_token\nvalue: ${REFRESH_TOKEN}actual-secret',
] as const;

const nearMissExamples = [
  `description: AKIA${'A'.repeat(15)}`,
  `description: ASIA${'A'.repeat(15)}`,
  `description: AIza${'B'.repeat(34)}`,
  `description: sk-${'c'.repeat(15)}`,
  `description: sk_${'d'.repeat(24)}`,
  `description: sk_live_${'E'.repeat(15)}`,
  `description: whsec_${'E'.repeat(15)}`,
  `description: xoxb-${'F'.repeat(15)}`,
  `description: SG.${'G'.repeat(21)}.${'H'.repeat(43)}`,
  `description: SG.${'I'.repeat(22)}.${'J'.repeat(42)}`,
  `description: SK${'0123456789abcdef'.repeat(2)}0`,
  `description: glpat-${'K'.repeat(15)}`,
  `description: hf_${'L'.repeat(19)}`,
  `description: ghp_${'M'.repeat(15)}`,
  `description: Bearer ${'n'.repeat(11)}`,
  `description: eyJ${'O'.repeat(7)}.${'P'.repeat(4)}.${'Q'.repeat(4)}`,
  `description: benign-high-entropy-${'R'.repeat(80)}`,
  'api_key: null',
  'access_token: ~',
  'authorization: ${AUTHORIZATION}',
  'client_secret: "{{ client_secret }}"',
  'credential: none',
  'credentials: unset',
  'password: your_password',
  'secret: change_me_before_use',
  'token: <token>',
  'auth_token: "{{ auth_token }}"',
  'refresh_token: your_refresh_token',
  'webhook_secret: change_me_before_use',
  'secret_key: <secret_key>',
  'private_key: redacted',
  'aws_secret_access_key: unset',
  'aws_access_key_id: ${AWS_ACCESS_KEY_ID}',
  'aws_security_token: <aws_security_token>',
  'aws_session_token: null',
  '{api_key: ${API_KEY}}',
  'variable: api_key\nvalue: redacted',
  'variable: refresh_token\nvalue: ${REFRESH_TOKEN}',
  'variable: api_key\nmetadata:\n  value: supplied-value',
  '- default: supplied-value\n- name: secret',
] as const;

describe('containsWorkflowSecret', () => {
  it.each(credentialExamples)('detects credential-shaped YAML text: %s', (credential) => {
    expect(containsWorkflowSecret(`description: "unsafe ${credential}"`)).toBe(true);
  });

  it.each(sensitiveValueExamples)('detects populated sensitive YAML values: %s', (yaml) => {
    expect(containsWorkflowSecret(yaml)).toBe(true);
  });

  it.each(nearMissExamples)('allows credential near-misses and placeholders: %s', (yaml) => {
    expect(containsWorkflowSecret(yaml)).toBe(false);
  });
});
