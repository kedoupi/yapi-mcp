#!/usr/bin/env tsx

import { YApiClient } from '../src/services/yapi-client.js';
import { Logger } from '../src/utils/logger.js';

/**
 * 认证优先级测试脚本
 * 验证当同时提供token和用户名密码时，优先使用token认证
 */

async function testTokenPriority() {
  const logger = new Logger('debug');
  
  console.log('🧪 测试认证优先级：Token vs 用户名密码\n');

  // 测试1: 只有用户名密码
  console.log('📋 测试1: 只提供用户名密码');
  try {
    const userOnlyConfig = {
      baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:40001',
      username: process.env.YAPI_USERNAME || 'kedoupi@gmail.com',
      password: process.env.YAPI_PASSWORD || 'qweqwe',
      logLevel: 'debug' as const
    };

    const userClient = new YApiClient(userOnlyConfig);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待初始化
    
    console.log('✅ 客户端初始化成功（仅用户认证）');
  } catch (error: any) {
    console.log('❌ 用户认证失败:', error.message);
  }

  // 测试2: 只有token（使用一个假token来测试逻辑）
  console.log('\n📋 测试2: 只提供项目Token');
  try {
    const tokenOnlyConfig = {
      baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:40001',
      projectToken: 'fake_token_for_priority_test',
      logLevel: 'debug' as const
    };

    const tokenClient = new YApiClient(tokenOnlyConfig);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待初始化
    
    console.log('✅ 客户端初始化成功（仅Token认证）');
  } catch (error: any) {
    console.log('❌ Token认证失败:', error.message);
  }

  // 测试3: 同时提供token和用户名密码（核心测试）
  console.log('\n📋 测试3: 同时提供Token和用户名密码（优先级测试）');
  try {
    const mixedConfig = {
      baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:40001',
      projectToken: 'fake_token_for_priority_test',
      username: process.env.YAPI_USERNAME || 'kedoupi@gmail.com',
      password: process.env.YAPI_PASSWORD || 'qweqwe',
      logLevel: 'debug' as const
    };

    console.log('配置信息:');
    console.log(`  Token: ${mixedConfig.projectToken}`);
    console.log(`  Username: ${mixedConfig.username}`);
    console.log(`  预期行为: 应该优先使用Token认证，不应该看到用户登录日志`);
    
    console.log('\n🚀 创建客户端...');
    const mixedClient = new YApiClient(mixedConfig);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待初始化
    
    console.log('✅ 客户端初始化完成');
    
    // 尝试调用一个API来验证认证方式
    console.log('\n🔍 测试API调用...');
    try {
      // 这里使用一个简单的API调用来观察认证行为
      await (mixedClient as any).request('/api/user/status');
    } catch (error: any) {
      // 我们期望这里会失败，因为token是假的
      // 但重要的是观察日志中的认证行为
      console.log('⚠️ API调用失败（预期行为，因为使用的是假token）:', error.message);
    }
    
  } catch (error: any) {
    console.log('❌ 混合配置测试失败:', error.message);
  }

  // 测试4: 验证有效token的优先级
  if (process.env.YAPI_PROJECT_TOKEN) {
    console.log('\n📋 测试4: 使用真实Token验证优先级');
    try {
      const realTokenConfig = {
        baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:40001',
        projectToken: process.env.YAPI_PROJECT_TOKEN,
        username: process.env.YAPI_USERNAME || 'kedoupi@gmail.com',
        password: process.env.YAPI_PASSWORD || 'qweqwe',
        logLevel: 'debug' as const
      };

      console.log('🚀 使用真实Token测试...');
      const realTokenClient = new YApiClient(realTokenConfig);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ 真实Token客户端初始化成功');
      
      // 尝试调用API
      try {
        const result = await realTokenClient.getProjects();
        console.log(`✅ Token认证成功: 找到 ${result.length} 个项目`);
      } catch (error: any) {
        console.log('⚠️ Token API调用失败:', error.message);
      }
      
    } catch (error: any) {
      console.log('❌ 真实Token测试失败:', error.message);
    }
  } else {
    console.log('\n📋 测试4: 跳过（没有提供YAPI_PROJECT_TOKEN）');
  }

  console.log('\n📊 测试总结:');
  console.log('1. 观察上面的日志输出');
  console.log('2. 在测试3中，应该看到 "Using project token authentication"');
  console.log('3. 在测试3中，不应该看到 "Attempting to login with username/password"');
  console.log('4. 这证明Token认证具有更高的优先级');
}

// 运行测试
testTokenPriority().catch(console.error);