import Tooltip from '@mui/material/Tooltip';
import { truncateText } from '../utils/constants';

export const TooltipLongText = ({ text, maxLength = 100, isEdit, onClick = () => {}}) => {
    return (
        <Tooltip title={text || ''} placement="top">
            {isEdit ? (
                <div onClick={onClick} className={`text-div ${onClick ? 'cursor-pointer' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: truncateText(text, maxLength) }} />
                </div>
            ) : (
                <div onClick={onClick} className={`text-div ${onClick ? 'cursor-pointer' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: truncateText(text, maxLength) }} />
                </div>
            )}
        </Tooltip>
    );
};
