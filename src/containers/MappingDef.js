/**
 * 转换规则定义
 */

import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Button } from 'react-bootstrap';
import { Grid as SSCGrid, Form as SSCForm} from 'ssc-grid';

import AdminDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';
import Formula from '../components/Formula';

import * as Actions from '../actions/mappingDef';

const BASE_DOC_ID = 'mappingdef';

/**
 * 会计平台 - 转换规则定义
 * 后端接口文档：http://git.yonyou.com/sscplatform/fc_doc/blob/master/exchanger/mapdef.md
 */

class MappingDef extends Component {
  static propTypes = {
    createDialog: PropTypes.object.isRequired,
    createTableBodyDataAndFetchTableBodyData: PropTypes.func.isRequired,
    editDialog: PropTypes.object.isRequired,
    editFormData: PropTypes.object.isRequired,
    fetchTableBodyData: PropTypes.func.isRequired,
    fetchTableColumnsModel: PropTypes.func.isRequired,
    itemsPerPage: PropTypes.number,
    pageAlert: PropTypes.object.isRequired,
    serverMessage: PropTypes.string.isRequired,
    showCreateDialog: PropTypes.func.isRequired,
    showEditDialog: PropTypes.func.isRequired,
    showPageAlert: PropTypes.func.isRequired,
    startIndex: PropTypes.number.isRequired,
    /**
     * store中存储的表体数据
     */
    tableBodyData: PropTypes.array.isRequired,
    /**
     * store中存储的表头数据
     */
    tableColumnsModel: PropTypes.array.isRequired,
    totalPage: PropTypes.number,
    updateTableBodyDataAndFetchTableBodyData: PropTypes.func.isRequired
  }

  state = {
    activePage: 1,
    startIndex: 0
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { itemsPerPage, startIndex } = this.props;
    this.props.fetchTableColumnsModel(BASE_DOC_ID);
    this.props.fetchTableBodyData(itemsPerPage, startIndex);
  }

  componentDidMount() {
    document.title = '转换规则定义';
    // this.refs.formula.showAlert();
  }

  componentWillReceiveProps(/* nextProps */) {
  }

  /**
   * 错误提示框
   */

  handlePageAlertDismiss() {
    this.props.showPageAlert(false);
  }

  /**
   * “”创建”按钮
   */

  // 点击“创建”按钮
  handleCreate(/* event */) {
    const { tableBodyData } = this.props;
    const rowData = tableBodyData[0];
    this.props.showCreateDialog(true, rowData);
    // event.preventDefault();
  }

  /**
   * 表格
   */

  // http://git.yonyou.com/sscplatform/ssc_web/commit/767e39de04b1182d8ba6ad55636e959a04b99d2b#note_3528
  // handlePagination(event, selectedEvent) {
  handlePagination(eventKey) {
    const { itemsPerPage } = this.props;
    let nextPage = eventKey;
    let startIndex = (nextPage - 1) * itemsPerPage;

    this.props.fetchTableBodyData(itemsPerPage, startIndex);

    this.setState({
      activePage: nextPage,
      startIndex
    });
  }

  /**
   * 创建对话框
   */

  closeCreateDialog() {
    this.props.showCreateDialog(false);
  }
  handleCreateFormSubmit(formData) {
    this.props.createTableBodyDataAndFetchTableBodyData(formData);
  }

  /**
   * 编辑对话框
   */

  closeEditDialog() {
    this.props.showEditDialog(false);
  }
  handleEditFormSubmit(formData) {
    this.props.updateTableBodyDataAndFetchTableBodyData(formData);
  }

  /**
   * 公式编辑器
   */

  handleDataBack() {
    
  }

  getCustomComponent() {
    const container = this;
    return React.createClass({
      handleEdit(/* event */) {
        const { rowIdx, rowObj } = this.props;
        // 将rowData保存到store中
        container.props.showEditDialog(true, rowIdx, rowObj);
      },
      handleRemove(event) {
        if (!confirm('是否删除？')) {
          return;
        }
        const { rowObj } = this.props;
        container.props.deleteTableBodyDataAndFetchTableBodyData(rowObj);
      },
      render() {
        const {rowObj: {
          id,
          des_billtype
        }} = this.props;
        return (
          <td>
            <span onClick={this.handleRemove}>删除</span>
            <span onClick={this.handleEdit}>修改</span>
            <Link to={`/entity-map-no-sidebar-single-page/${des_billtype}/${id}`}>
              子表
            </Link>
          </td>
        );
      }
    });
  }

  render() {
    const {
      itemsPerPage, tableColumnsModel, tableBodyData, pageAlert
    } = this.props;

    return (
      <div className="mapping-def-container content">
        <Formula ref="formula" eid='10' backFormula={::this.handleDataBack} />
        <AdminAlert
            show={pageAlert.show}
            bsStyle={pageAlert.bsStyle}
            onDismiss={::this.handlePageAlertDismiss}
        >
          <p>{pageAlert.message}</p>
        </AdminAlert>
        <div className="head" style={{textAlign: 'right'}}>
          <Button className="btn btn-default" onClick={::this.handleCreate}>新增</Button>
        </div>
        <div>
          <SSCGrid className="ssc-grid"
            columnsModel={tableColumnsModel}
            tableData={tableBodyData}
            // 分页
            paging
            itemsPerPage={itemsPerPage}
            totalPage={this.props.totalPage}
            activePage={this.state.activePage}
            onPagination={::this.handlePagination}
            operationColumn={{}}
            operationColumnClass={this.getCustomComponent()}
          />
        </div>
        <AdminDialog
          className="create-form"
          title="新增"
          show={this.props.createDialog.show}
          onHide={::this.closeCreateDialog}
        >
          <p className="server-message" style={{color: 'red'}}>
            {this.props.serverMessage}
          </p>
          <SSCForm
            fieldsModel={tableColumnsModel}
            defaultData={this.state.createFormData}
            onSubmit={::this.handleCreateFormSubmit}
            onReset={::this.closeCreateDialog}
          />
        </AdminDialog>
        <AdminDialog
          className="edit-form"
          title="编辑"
          show={this.props.editDialog.show}
          onHide={::this.closeEditDialog}
        >
          <p className="server-message" style={{color: 'red'}}>
            {this.props.serverMessage}
          </p>
          <SSCForm
            fieldsModel={tableColumnsModel}
            defaultData={this.props.editFormData}
            onSubmit={::this.handleEditFormSubmit}
            onReset={::this.closeEditDialog}
          />
        </AdminDialog>
      </div>
    );
  }
}

const mapStateToProps = (state/* , ownProps */) => {
  return {...state.mappingDef};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
};

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(MappingDef);
