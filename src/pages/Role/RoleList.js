import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Row, Col, Card, Input, Button, Table, Modal, Badge } from 'antd';
import PageHeaderLayout from '@/layouts/PageHeaderLayout';
import PButton from '@/components/PermButton';
import { formatDate } from '@/utils/utils';
import RoleCard from './RoleCard';

import styles from './RoleList.less';

@connect(state => ({
  role: state.role,
  loading: state.loading.models.role,
}))
@Form.create()
class RoleList extends PureComponent {
  state = {
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() {
    this.dispatch({
      type: 'role/fetch',
      search: {},
      pagination: {},
    });
  }

  onItemDisableClick = item => {
    this.dispatch({
      type: 'role/changeStatus',
      payload: { record_id: item.record_id, status: 2 },
    });
  };

  onItemEnableClick = item => {
    this.dispatch({
      type: 'role/changeStatus',
      payload: { record_id: item.record_id, status: 1 },
    });
  };

  clearSelectRows = () => {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length === 0) {
      return;
    }
    this.setState({ selectedRowKeys: [], selectedRows: [] });
  };

  dispatch = action => {
    const { dispatch } = this.props;
    dispatch(action);
  };

  handleAddClick = () => {
    this.dispatch({
      type: 'role/loadForm',
      payload: {
        type: 'A',
      },
    });
  };

  handleEditClick = item => {
    this.dispatch({
      type: 'role/loadForm',
      payload: {
        type: 'E',
        id: item.record_id,
      },
    });
  };

  handleDelClick = item => {
    Modal.confirm({
      title: `确定删除【角色数据：${item.name}】？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: this.handleDelOKClick.bind(this, item.record_id),
    });
  };

  handleTableSelectRow = (record, selected) => {
    const keys = [];
    const rows = [];
    if (selected) {
      keys.push(record.record_id);
      rows.push(record);
    }
    this.setState({
      selectedRowKeys: keys,
      selectedRows: rows,
    });
  };

  handleTableChange = pagination => {
    this.dispatch({
      type: 'role/fetch',
      pagination: {
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    });
    this.clearSelectRows();
  };

  onResetFormClick = () => {
    const { form } = this.props;
    form.resetFields();

    this.dispatch({
      type: 'role/fetch',
      search: {},
      pagination: {},
    });
  };

  handleSearchFormSubmit = e => {
    if (e) {
      e.preventDefault();
    }

    const { form } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (err) {
        return;
      }
      this.dispatch({
        type: 'role/fetch',
        search: values,
        pagination: {},
      });
      this.clearSelectRows();
    });
  };

  handleDataFormSubmit = data => {
    this.dispatch({
      type: 'role/submit',
      payload: data,
    });
    this.clearSelectRows();
  };

  handleDataFormCancel = () => {
    this.dispatch({
      type: 'role/changeFormVisible',
      payload: false,
    });
  };

  handleDelOKClick(id) {
    this.dispatch({
      type: 'role/del',
      payload: { record_id: id },
    });
    this.clearSelectRows();
  }

  renderDataForm() {
    return <RoleCard onCancel={this.handleDataFormCancel} onSubmit={this.handleDataFormSubmit} />;
  }

  renderSearchForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form onSubmit={this.handleSearchFormSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item>
              {getFieldDecorator('queryValue')(<Input placeholder="请输入需要查询的内容" />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <div style={{ overflow: 'hidden', paddingTop: 4 }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.onResetFormClick}>
                重置
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      role: {
        data: { list, pagination },
      },
    } = this.props;

    const { selectedRowKeys, selectedRows } = this.state;

    const columns = [
      {
        title: '角色名称',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: '排序值',
        dataIndex: 'sequence',
        width: 100,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 80,
        render: val => {
          if (val === 1) {
            return <Badge status="success" text="启用" />;
          }
          return <Badge status="error" text="停用" />;
        },
      },
      {
        title: '创建时间',
        width: 100,
        dataIndex: 'created_at',
        render: val => <span>{formatDate(val, 'YYYY-MM-DD')}</span>,
      },
      {
        title: '备注',
        dataIndex: 'memo',
      },
    ];

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: total => <span>共{total}条</span>,
      ...pagination,
    };

    const breadcrumbList = [{ title: '系统管理' }, { title: '角色管理', href: '/system/role' }];

    return (
      <PageHeaderLayout title="角色管理" breadcrumbList={breadcrumbList}>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <div className={styles.tableListOperator}>
              <PButton code="add" type="primary" onClick={() => this.handleAddClick()}>
                新建
              </PButton>
              {selectedRows.length === 1 && [
                <PButton
                  key="edit"
                  code="edit"
                  onClick={() => this.handleEditClick(selectedRows[0])}
                >
                  编辑
                </PButton>,
                <PButton
                  key="del"
                  code="del"
                  type="danger"
                  onClick={() => this.handleDelClick(selectedRows[0])}
                >
                  删除
                </PButton>,
                selectedRows[0].status === 2 && (
                  <PButton
                    key="enable"
                    code="enable"
                    onClick={() => this.onItemEnableClick(selectedRows[0])}
                  >
                    启用
                  </PButton>
                ),
                selectedRows[0].status === 1 && (
                  <PButton
                    key="disable"
                    code="disable"
                    type="danger"
                    onClick={() => this.onItemDisableClick(selectedRows[0])}
                  >
                    禁用
                  </PButton>
                ),
              ]}
            </div>
            <div>
              <Table
                rowSelection={{
                  selectedRowKeys,
                  onSelect: this.handleTableSelectRow,
                }}
                loading={loading}
                rowKey={record => record.record_id}
                dataSource={list}
                columns={columns}
                pagination={paginationProps}
                onChange={this.handleTableChange}
                size="small"
              />
            </div>
          </div>
        </Card>
        {this.renderDataForm()}
      </PageHeaderLayout>
    );
  }
}

export default RoleList;
