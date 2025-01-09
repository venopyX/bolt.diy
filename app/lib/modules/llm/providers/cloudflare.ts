import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo, ProviderConfig } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class CloudflareProvider extends BaseProvider {
  name = 'Cloudflare';
  getApiKeyLink = 'https://dash.cloudflare.com/profile/api-tokens';
  labelForGetApiKey = 'Create a Workers AI API Token';

  config: ProviderConfig = {
    apiTokenKey: 'CLOUDFLARE_API_KEY',
    baseUrlKey: 'CLOUDFLARE_ACCOUNT_ID',
    baseUrl: 'c3ed7c0bd399de1714eefbf0afad82b7', // Default account ID
  };

  staticModels: ModelInfo[] = [
    {
      name: '@cf/meta/llama-3.1-8b-instruct',
      label: 'Llama 2 (8B)',
      provider: 'Cloudflare',
      maxTokenAllowed: 4096, // Adjust this value based on actual model limits
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: Env;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey, baseUrl: accountId } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: 'CLOUDFLARE_ACCOUNT_ID',
      defaultApiTokenKey: 'CLOUDFLARE_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    if (!accountId) {
      throw new Error(`Missing Account ID for ${this.name} provider`);
    }

    const baseURL = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1`;

    const openai = createOpenAI({
      apiKey,
      baseURL,
    });

    return openai(model);
  }
}
