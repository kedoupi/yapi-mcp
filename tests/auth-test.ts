#!/usr/bin/env node

import { YApiClient } from '../src/services/yapi-client.js';
import { Logger } from '../src/utils/logger.js';

async function testUserAuth() {
  const logger = new Logger('debug');
  
  // 测试用户名密码认证
  const config = {
    baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:3000',
    username: process.env.YAPI_USERNAME || 'kedoupi@gmail.com',
    password: process.env.YAPI_PASSWORD || 'qweqwe',
    logLevel: 'debug' as const
  };

  logger.info('🧪 Testing YApi User Authentication');
  logger.info('Configuration:', {
    baseUrl: config.baseUrl,
    username: config.username,
    passwordProvided: !!config.password
  });

  try {
    const client = new YApiClient(config);
    
    // 等待一下让初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info('✅ YApi client initialized successfully');
    
    // 测试获取项目信息
    logger.info('🔍 Testing project access...');
    const projects = await client.getProjects();
    logger.info(`📊 Found ${projects.length} projects:`, projects.map(p => ({
      id: p._id,
      name: p.name,
      desc: p.desc
    })));

    // 如果有项目，测试获取分类
    if (projects.length > 0) {
      const project = projects[0];
      logger.info(`📂 Testing categories for project: ${project.name}`);
      
      try {
        const categories = await client.getCategories(project._id);
        logger.info(`📋 Found ${categories.length} categories:`, categories.map(c => ({
          id: c._id,
          name: c.name,
          desc: c.desc
        })));
      } catch (error: any) {
        logger.warn('Categories test failed:', error.message);
      }
    }

    logger.info('🎉 User authentication test completed successfully!');
    return true;

  } catch (error: any) {
    logger.error('❌ Authentication test failed:', error.message);
    
    // 提供更详细的错误信息
    if (error.message.includes('Failed to authenticate')) {
      logger.error('🔐 Authentication Error Details:');
      logger.error('- Check if the username and password are correct');
      logger.error('- Verify YApi server is running and accessible');
      logger.error('- Ensure user account exists and is active');
    }
    
    return false;
  }
}

async function testTokenAuth() {
  const logger = new Logger('debug');
  
  // 测试项目token认证（作为对比）
  const config = {
    baseUrl: process.env.YAPI_BASE_URL || 'http://localhost:3000',
    projectToken: process.env.YAPI_PROJECT_TOKEN,
    logLevel: 'debug' as const
  };

  if (!config.projectToken) {
    logger.info('⏭️ Skipping token authentication test (no YAPI_PROJECT_TOKEN provided)');
    return true;
  }

  logger.info('🔑 Testing YApi Token Authentication');
  
  try {
    const client = new YApiClient(config);
    const projects = await client.getProjects();
    logger.info(`✅ Token auth works: Found ${projects.length} projects`);
    return true;
  } catch (error: any) {
    logger.error('❌ Token authentication failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 YApi Authentication Test Suite\n');
  
  const results = {
    userAuth: await testUserAuth(),
    tokenAuth: await testTokenAuth()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log(`User Authentication: ${results.userAuth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Token Authentication: ${results.tokenAuth ? '✅ PASS' : '❌ FAIL'}`);
  
  if (results.userAuth) {
    console.log('\n🎉 用户认证测试成功！现在可以使用用户名密码方式配置MCP服务器');
    console.log('\n配置示例:');
    console.log('YAPI_BASE_URL=http://localhost:3000');
    console.log('YAPI_USERNAME=kedoupi@gmail.com');
    console.log('YAPI_PASSWORD=qweqwe');
  }
  
  process.exit(results.userAuth ? 0 : 1);
}

main().catch(console.error);