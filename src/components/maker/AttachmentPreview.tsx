import { useEffect, useState } from 'react';
import { Download, Image as ImageIcon, Paperclip } from 'lucide-react';
import { requisitionApi } from '../../api/modules/requisitionApi';

type Props = { attachment: { id: number; originalFileName: string; mimeType: string | null; fileSize: number }; requisitionId: number };

export function AttachmentPreview({ attachment, requisitionId }: Props) {
  const [url, setUrl] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const isImage = attachment.mimeType?.startsWith('image/') ?? false;
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    requisitionApi.attachmentContent(attachment.id, requisitionId).then(value => {
      objectUrl = value;
      if (active) setUrl(value); else URL.revokeObjectURL(value);
    }).catch(() => active && setUnavailable(true));
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [attachment.id, requisitionId]);
  return <article className="attachment-preview-card">
    {isImage && url ? <img src={url} alt={attachment.originalFileName} /> : <div className="attachment-file-icon">{isImage ? <ImageIcon /> : <Paperclip />}</div>}
    <div className="attachment-preview-info"><strong>{attachment.originalFileName}</strong><small>{Math.ceil(attachment.fileSize / 1024)} KB</small>{unavailable && <span>File content is unavailable. Open Edit and upload the file again.</span>}</div>
    {url && <a className="attachment-download" href={url} download={attachment.originalFileName}><Download /> Download</a>}
  </article>;
}
