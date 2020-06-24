import React from 'react';
import { connect } from 'react-redux';
import {
  Dropdown,
  Menu as AntdMenu,
  Layout,
  Spin,
  Avatar,
  message,
} from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { LOADINGNAMESPACE } from '@tencent/rsf';
import { Menu, Breadcrumb, ScrollContainer } from '@tencent/rsf';

import routesConfig from '$src/routes.config';
import { namespace as globalDataNamespace } from '$mutations/api/globalData';
import axios from '$utils/axios';
import logo from '$assets/img/logo.png';

import styles from './Main.module.less';

const { Sider, Header, Footer, Content } = Layout;

@connect(state => {
  return {
    globalData: state[globalDataNamespace],
    globalDataLoading: state[LOADINGNAMESPACE][globalDataNamespace],
  };
})
@withRouter
class MainLayout extends React.Component {
  static displayName = 'MainLayout';

  state = {
    collapsed: false,
  };

  onCollapse = e => {
    const { collapsed } = this.state;

    this.setState({ collapsed: !collapsed });
  };

  logout = () => {
    axios.get('auth/logout').then(result => {
      message.success('退出登录成功，正在跳转...');
      setTimeout(() => {
        window.location.reload();
      }, 200);
      // const searchParams = new URLSearchParams(window.location.search);
      // searchParams.delete('auth_cm_com_ticket');
      // const paramsStr = searchParams.toString();
      // const referer = `${window.location.href.replace(/\?.*/, '')}${
      //   paramsStr ? '?' + paramsStr : ''
      // }`;
      // window.location.replace();
    });
  };

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({
      type: `${globalDataNamespace}/request`,
    });
  }

  render() {
    const { collapsed } = this.state;
    const {
      globalDataLoading,
      children,
      history,
      location: { pathname },
      globalData: {
        authInfo: { userInfo = {} },
      },
    } = this.props;
    const siderWidth = collapsed ? 80 : 250;

    return (
      <Layout className={styles.layoutContainer}>
        <ScrollContainer
          height="100%"
          width={siderWidth}
          className={styles.siderContainer}
        >
          <Sider
            width={siderWidth}
            collapsible
            collapsed={collapsed}
            trigger={null}
          >
            <div className={styles.logo}>
              <img alt="" src={logo} />
              {!collapsed && (
                <h3 className={styles.logoTitle}>广告数据分析平台</h3>
              )}
            </div>
            <Menu
              className={styles.menu}
              theme="dark"
              routes={routesConfig}
              pathname={pathname}
              collapsed={collapsed}
              history={history}
            />
          </Sider>
        </ScrollContainer>
        <Layout className={styles.main} style={{ paddingLeft: siderWidth }}>
          {globalDataLoading && (
            <Spin
              size="large"
              tip="加载中..."
              className={styles.globalSpin}
              style={{ paddingLeft: siderWidth }}
            />
          )}
          {
            // globalDataLoading = undefined 时也不需要展示
            globalDataLoading === false && (
              <>
                <Header className={styles.header}>
                  <div className={styles.headerLeft}>
                    {collapsed && (
                      <MenuUnfoldOutlined
                        className={styles.menuFoldBtn}
                        onClick={this.onCollapse}
                      />
                    )}
                    {!collapsed && (
                      <MenuFoldOutlined
                        className={styles.menuFoldBtn}
                        onClick={this.onCollapse}
                      />
                    )}
                  </div>
                  <div className={styles.headerRight}>
                    <Dropdown
                      overlay={
                        <AntdMenu>
                          <AntdMenu.Item onClick={this.logout}>
                            退出登录
                          </AntdMenu.Item>
                        </AntdMenu>
                      }
                    >
                      <div className={styles.userContainer}>
                        <Avatar
                          src={userInfo.photoUrl}
                          className={styles.avatar}
                        />
                        <span className={styles.userName}>{userInfo.name}</span>
                      </div>
                    </Dropdown>
                  </div>
                </Header>
                <Content className={styles.body}>
                  <Breadcrumb
                    className={styles.breadcrumb}
                    routes={routesConfig}
                    pathname={pathname}
                  />
                  <div className={styles.bodyContent}>{children}</div>
                </Content>
                <Footer className={styles.footer}>
                  Blackcat 广告数据分析平台 @2020
                </Footer>
              </>
            )
          }
        </Layout>
      </Layout>
    );
  }
}

export default MainLayout;
