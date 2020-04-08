import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { Card, Table, Upload, Button, Row, Col, Empty, Modal, notification, message } from 'antd';
import { UpFile } from '@/data.d';
import { upFileRequest } from '@/services/globle';
import { getDate } from '@/utils/utils';
import { getBaseUrl, isDevelopment } from '@/utils/utils'
import styles from './style.less';

interface UpFileProp {
  // 逻辑用
  fileList: UpFile[], // 文件列表
  disabled: boolean, // 是否允许操作列表
  upFileNumber?: number,// 上传文件数
  handlerSetFileList?: (fileList: UpFile[]) => void, // 保存操作后的列表

  // 样式用
  buttonStyle?: React.ReactNode,// 按钮样式 默认按钮
  modalTitle?: React.ReactNode,// 弹窗标题

  // 表单用
  onChange?: any,
  value?: any[]
}

const UpFile: React.FC<UpFileProp> = (props, ref) => {
  const { fileList, disabled, upFileNumber, handlerSetFileList, onChange, value, buttonStyle, modalTitle } = props;
  // 显示文件弹窗
  const [showModal, setShowModal] = useState<boolean>(false);
  const [upFileLoading, setUpFileIdLoading] = useState<boolean>(false);
  const [loaclFileList, setLoaclFileList] = useState<UpFile[]>(() =>
    fileList.map(item => {
      item.isUpload = true;
      return item;
    }),
  );
  // 正在上传的文件的id
  const [upFileId, setUpFileId] = useState<number | string | undefined>()

  const [fileBlobObj, setFileBlobObj] = useState<object>({});

  useEffect(() => {
    setLoaclFileList(fileList.map(item => {
      item.isUpload = true;
      return item;
    }))
  }, [fileList])

  // 上传插件按钮
  const handleUpload = async (row: UpFile) => {
    try {
      if (parseFloat(row.size!) > 150000) {
        message.error('该文件大于150MB，请重新选择')
        return
      }
      setUpFileIdLoading(true);
      setUpFileId(row.id)
      const formData = new FormData();
      formData.append('file', fileBlobObj[row.id!]);
      const res = await upFileRequest(formData);
      // 这里要获取最新的upFileLoading , upFileId 防止文件上传一半用户删除 而后面的代码还执行了
      let nowUpFileLoading, nowUpFileId;
      setUpFileIdLoading(upFileLoading => {
        nowUpFileLoading = upFileLoading
        return upFileLoading
      })
      setUpFileId(upFileId => {
        nowUpFileId = upFileId
        return upFileId
      })
      if (nowUpFileLoading && nowUpFileId === row.id) {
        const fileData = res.data;
        fileData.isUpload = true;
        const newLoaclFileList = loaclFileList.map(item => {
          if (item.id === row.id) {
            return fileData;
          } else {
            return item;
          }
        });
        setLoaclFileList(newLoaclFileList);
        setUpFileId(undefined)
        setUpFileIdLoading(false);
      }
    } catch (e) {
      console.log(e);
      notification.error({
        description: e.errorMsg,
        message: '错误'
      })
      setUpFileId(undefined)
      setUpFileIdLoading(false);
    }
  };

  // 删除按钮
  const handleDelete = async (id: number | string) => {
    const newLoaclFileList = loaclFileList.filter(item => item.id !== id);
    setLoaclFileList(newLoaclFileList);
    setUpFileIdLoading(false);
  };

  // 下载按钮
  const handleDownload = async (file: UpFile) => {
    let path = `${getBaseUrl()}${file.path!}`
    // if (isDevelopment()) {
    //   path = `${getBaseUrl()}${file.path!}`
    // } else {
    //   path = file.path!.replace('http://122.51.217.213:8099', getBaseUrl())
    // }
    console.log(path)
    // 同源情况下有用
    const elt = document.createElement('a');
    elt.setAttribute('href', path);
    elt.setAttribute('download', file.name || '');
    elt.style.display = 'none';
    document.body.appendChild(elt);
    elt.click();
    document.body.removeChild(elt);
  }

  // 预览按钮
  const handlePreview = async (file: UpFile) => {
    let path = `${getBaseUrl()}${file.path!}`
    console.log(path)
    window.open(path);
  };

  // 保存文件按钮
  const handleSaveFile = async () => {
    let okFileList = loaclFileList.filter(item => item.isUpload)
    handlerSetFileList!(okFileList);
    setShowModal(false)
    if (onChange) {
      onChange(okFileList.length > 0 ? okFileList.map(item => item.id) : null);
    }
  };

  // 取消按钮
  const handleCancal = () => {
    setShowModal(false)
    setUpFileIdLoading(false);
  };

  const upLoadAttr = {
    beforeUpload: (file: any) => {
      const fileData = {
        id: file.uid as number,
        name: file.name as string,
        size: `${(file.size / 1024).toFixed(2)}kb`,
        isUpload: false,
      };
      setLoaclFileList([...loaclFileList, fileData]);
      setFileBlobObj({ ...fileBlobObj, [file.uid]: file });
      return false;
    },
    showUploadList: false,
  };

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '上传人',
      dataIndex: 'creator',
      key: 'creator',
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (text: UpFile, record: UpFile, index: number) => {
        return record.createTime ? getDate(record.createTime!, 'yyyy-mm-dd hh:mm:ss').time : '';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: '25%',
      align: 'center' as 'center',
      render: (text: UpFile, record: UpFile, index: number) => {
        // 先判断是否禁用 
        // 禁用情况下 不允许添加或删除
        return (
          <Button.Group>
            {
              !disabled && (
                <>
                  {
                    !record.isUpload && (
                      <Button
                        loading={upFileLoading && record.id === upFileId}
                        disabled={upFileLoading}
                        onClick={() => {
                          handleUpload(record);
                        }}
                      >
                        上传
                      </Button>
                    )}
                  <Button
                    onClick={() => {
                      handleDelete(record.id as number);
                    }}
                  >
                    删除
                </Button>
                </>
              )
            }
            {record.isUpload && <Button onClick={() => handlePreview(record)}>预览</Button>}
            {/* {disabled && <Button onClick={() => handleDownload(record)}>下载</Button>} */}
            {disabled && <Button onClick={() => handleDownload(record)}>下载</Button>}
          </Button.Group>
        );
      },
    },
  ]; // 表格配置

  return (
    <div ref={ref}>
      <div onClick={() => setShowModal(true)}>
        {
          buttonStyle ? buttonStyle : <Button block>点击上传</Button>
        }
      </div>
      <Modal
        title={modalTitle ? modalTitle : (disabled ? '文件' : '上传')}
        width={1200}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={false}
        maskClosable={false}
      >
        {
          !disabled && (!upFileNumber || loaclFileList.length < upFileNumber) && <div className="box box-row-end" >
            <Upload {...upLoadAttr}>
              <Button
                className="mb-3"
                size="large"
                loading={upFileLoading}
                disabled={upFileLoading}>
                新增</Button>
            </Upload>
          </div>
        }

        <Row className="mb-3" gutter={16}>
          <Col span={6}>
            <Card className={styles['upfile-left-card']} title="附件列表">
              {loaclFileList.map((item, index) => (
                <div key={`${item.id || item.name} ${index}`}>{item.name}</div>
              ))}
              {loaclFileList.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : ''}
            </Card>
          </Col>
          <Col span={18}>
            <Table
              bordered
              // rowClassName={()=>}
              rowKey={record => `${record.id} rowKey`}
              pagination={false}
              columns={columns}
              dataSource={loaclFileList}
            />
          </Col>
        </Row>
        {
          !disabled && <div className="box box-row-end">
            <Button
              className="ml-3"
              size="large"
              loading={upFileLoading}
              disabled={upFileLoading}
              onClick={handleSaveFile}
            >
              保存
        </Button>
            <Button className="ml-3" size="large" onClick={handleCancal}>
              取消
        </Button>
          </div>
        }
      </Modal>

    </div >
  );
};

export default forwardRef(UpFile);
