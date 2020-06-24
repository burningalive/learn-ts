import React from 'react';
import RsfApp from '@tencent/rsf';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount, render } from 'enzyme';
import MainLayout from '$view/layout/Main';
import mutations from '$src/mutations';

describe('src/view/layout/Main.jsx', () => {
  function TestComponent(props) {
    const {
      initialState = {
        $loading: {
          '/globalData': false,
        },
      },
      ...otherProps
    } = props;

    return (
      <RsfApp mutations={mutations} initialState={initialState}>
        <Router {...otherProps}>
          <MainLayout />
        </Router>
      </RsfApp>
    );
  }

  it('MainLayout is wrapped with `withRouter HOC`', () => {
    const wrapper = mount(<TestComponent />);
    const MainLayoutInstance = wrapper.find('MainLayout');
    const { location, history, match } = MainLayoutInstance.props();

    expect(!!location).toBeTruthy();
    expect(!!history).toBeTruthy();
    expect(!!match).toBeTruthy();
  });

  it('content loading', () => {
    const wrapper = mount(
      <TestComponent
        initialState={{
          $loading: {
            '/globalData': true,
          },
        }}
      />
    );
    const menuFolderBtnWrapper = wrapper.find(
      '.ant-layout-header .anticon-menu-fold'
    );

    expect(menuFolderBtnWrapper).toHaveLength(0);
  });

  it('menu collapsed`', () => {
    const wrapper = mount(<TestComponent />);
    // .menuFoldBtn 会找到两个，应该是切换后的状态，都是这个 class，所以不适用 .menuFoldBtn
    const menuFolderBtnWrapper = wrapper.find(
      '.ant-layout-header .anticon-menu-fold'
    );

    expect(menuFolderBtnWrapper).toHaveLength(1);

    menuFolderBtnWrapper.simulate('click');

    expect(wrapper.find('.ant-layout-sider-collapsed')).toHaveLength(1);
  });

  it('logo works correctly', () => {
    const wrapper = mount(<TestComponent />);
    const logoWrapper = wrapper.find('.logo');
    expect(logoWrapper).toHaveLength(1);
    expect(logoWrapper.find('.logoTitle')).toHaveLength(1);
    expect(logoWrapper.text()).toEqual('广告数据分析平台');
  });

  describe('pathname="/"', () => {
    const wrapper = mount(<TestComponent initialEntries={['/']} />);

    it('equals snapshots', () => {
      const html = render(<TestComponent initialEntries={['/']} />);
      expect(html).toMatchSnapshot();
    });

    it('menu works correctly', () => {
      const menuLiWrapper = wrapper.find('.ant-menu li');
      const liZero = menuLiWrapper.at(0);
      const liOne = menuLiWrapper.at(1);
      const liTwo = menuLiWrapper.at(2);

      expect(menuLiWrapper).toHaveLength(3);
      expect(liZero.find('.ant-menu-item-selected')).toHaveLength(1);
      expect(liZero.text()).toEqual('主页');
      expect(liOne.text()).toEqual('用户管理');
      expect(liOne.find('.ant-menu-submenu-arrow')).toHaveLength(1);
      expect(liTwo.text()).toEqual('异常页面');
      expect(liTwo.find('.ant-menu-submenu-arrow')).toHaveLength(1);

      liOne.find('.ant-menu-submenu-arrow').simulate('click');
      liTwo.find('.ant-menu-submenu-arrow').simulate('click');

      expect(liOne.text()).toEqual('用户管理用户列表测试页面');
      expect(liTwo.text()).toEqual('异常页面404403500');
    });
  });

  describe('pathname="/user/list"', () => {
    const wrapper = mount(<TestComponent initialEntries={['/user/list']} />);

    it('equals snapshots', () => {
      const html = render(<TestComponent initialEntries={['/user/list']} />);
      expect(html).toMatchSnapshot();
    });

    it('menu works correctly', () => {
      const menuLiWrapper = wrapper.find('.ant-menu li');
      const liZero = menuLiWrapper.at(0);
      const liOne = menuLiWrapper.at(1);
      const liTwo = menuLiWrapper.at(2);
      const liThree = menuLiWrapper.at(3);
      const liFour = menuLiWrapper.at(4);

      expect(menuLiWrapper).toHaveLength(5);
      expect(liZero.text()).toEqual('主页');
      expect(liOne.find('.ant-menu-item-selected')).toHaveLength(1);
      expect(liOne.text()).toEqual('用户管理用户列表测试页面');
      expect(liTwo.text()).toEqual('用户列表');
      expect(liThree.text()).toEqual('测试页面');
      expect(liThree.find('.ant-menu-submenu-arrow')).toHaveLength(1);
      expect(liFour.text()).toEqual('异常页面');
      expect(liFour.find('.ant-menu-submenu-arrow')).toHaveLength(1);

      liThree.find('.ant-menu-submenu-arrow').simulate('click');
      liFour.find('.ant-menu-submenu-arrow').simulate('click');

      expect(liThree.text()).toEqual('测试页面测试页面一测试页面二');
      expect(liFour.text()).toEqual('异常页面404403500');
    });
  });

  describe('pathname="/user/test/one"', () => {
    const wrapper = mount(
      <TestComponent initialEntries={['/user/test/one']} />
    );

    it('equals snapshots', () => {
      const html = render(
        <TestComponent initialEntries={['/user/test/one']} />
      );
      expect(html).toMatchSnapshot();
    });

    it('menu works correctly', () => {
      const menuLiWrapper = wrapper.find('.ant-menu li');
      const liZero = menuLiWrapper.at(0);
      const liOne = menuLiWrapper.at(1);
      const liTwo = menuLiWrapper.at(2);
      const liThree = menuLiWrapper.at(3);
      const liFour = menuLiWrapper.at(4);
      const liFive = menuLiWrapper.at(5);
      const liSix = menuLiWrapper.at(6);

      expect(menuLiWrapper).toHaveLength(7);
      expect(liZero.text()).toEqual('主页');
      expect(liOne.text()).toEqual(
        '用户管理用户列表测试页面测试页面一测试页面二'
      );
      expect(liTwo.text()).toEqual('用户列表');
      expect(liThree.text()).toEqual('测试页面测试页面一测试页面二');
      expect(liFour.find('.ant-menu-item-selected')).toHaveLength(1);
      expect(liFour.text()).toEqual('测试页面一');
      expect(liFive.text()).toEqual('测试页面二');
      expect(liSix.text()).toEqual('异常页面');
    });
  });

  describe('pathname="/warning/404"', () => {
    const wrapper = mount(<TestComponent initialEntries={['/warning/404']} />);

    it('equals snapshots', () => {
      const html = render(<TestComponent initialEntries={['/warning/404']} />);
      expect(html).toMatchSnapshot();
    });

    it('menu works correctly', () => {
      const menuLiWrapper = wrapper.find('.ant-menu li');
      const liZero = menuLiWrapper.at(0);
      const liOne = menuLiWrapper.at(1);
      const liTwo = menuLiWrapper.at(2);
      const liThree = menuLiWrapper.at(3);
      const liFour = menuLiWrapper.at(4);
      const liFive = menuLiWrapper.at(5);

      expect(menuLiWrapper).toHaveLength(6);
      expect(liZero.text()).toEqual('主页');
      expect(liOne.text()).toEqual('用户管理');
      expect(liTwo.text()).toEqual('异常页面404403500');
      expect(liThree.text()).toEqual('404');
      expect(liThree.find('.ant-menu-item-selected')).toHaveLength(1);
      expect(liFour.text()).toEqual('403');
      expect(liFive.text()).toEqual('500');
    });
  });
});
