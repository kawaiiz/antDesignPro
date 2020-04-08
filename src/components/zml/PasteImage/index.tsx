import React, { useState, useEffect, forwardRef } from 'react';
import { Card, Table, Upload, Button, Row, Col, Empty, Modal, message } from 'antd';
import { UpFile } from '@/data.d';
import { upFileRequest } from '@/services/globle';
import styles from './style.less';

interface PasteImageProp {
  handleSaveFile: (fileDesc: UpFile, file: File) => void,// 文件提交上传事件 
  handleCancal: () => void,// 点击取消
}

const PasteImage: React.FC<PasteImageProp> = (props, ref) => {
  const { handleSaveFile, handleCancal } = props
  // 截图的图片
  const [file, setFile] = useState<File | null>(null)
  //  截图图片的url
  const [fileSrc, setFileSrc] = useState<string>('')

  const [upFileLoading, setUpFileLoading] = useState<boolean>(false);

  // 上传插件按钮
  const handleUpload = async () => {
    try {
      if (!file) {
        message.error('请截图后点击保存！')
        return
      }
      const formData = new FormData();
      formData.append('file', file);
      setUpFileLoading(true);
      const res = await upFileRequest(formData);
      const fileData = res.data;
      setUpFileLoading(false);
      handleSaveFile(fileData, file)
    } catch (e) {
      message.error('上传失败，请重试！')
      setUpFileLoading(false);
    }
  };

  return <div className={`${styles['paste-image-box']} box box-col-center`} ref={ref}>
    <div
      onPaste={(e) => {
        e.persist()
        if (e.clipboardData.files.length !== 0) {
          const file = e.clipboardData.files[0]
          setFile(file)
          var blobUrl = URL.createObjectURL(file);
          console.log(blobUrl)
          setFileSrc(blobUrl)
        }
      }}
      className={`${styles['image-block']} mb-4 box box-row-center bg-img-contain`}
    >
      {
        !fileSrc && <span className={styles['tip-text']}>请截图，Ctrl + V 在框中直接粘贴</span>
      }
      {
        fileSrc && <img className={styles['up-img']} src={fileSrc} alt="" />
      }
    </div>
    <div className="box box-row-center ">
      <Button
        className="ml-3"
        type="primary"
        loading={upFileLoading}
        disabled={upFileLoading}
        onClick={handleUpload}
      >
        保存
        </Button>
      <Button className="ml-3" onClick={handleCancal}>
        取消
        </Button>
    </div>
  </div >
}

export default forwardRef(PasteImage);