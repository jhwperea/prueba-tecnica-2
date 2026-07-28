import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import { getStatusesByScopeAPI } from 'api/requests/appApi';

const STATUS_CACHE = {};
const CACHE_PENDING = {};

export default function StatusChip({ staId, label, scope = 'GENERAL', colorMap }) {
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    if (!scope) return;
    if (STATUS_CACHE[scope]) {
      setStatusData(STATUS_CACHE[scope]);
      return;
    }
    if (CACHE_PENDING[scope]) {
      CACHE_PENDING[scope].then(setStatusData);
      return;
    }
    const promise = getStatusesByScopeAPI(scope).then(({ data }) => {
      STATUS_CACHE[scope] = data;
      CACHE_PENDING[scope] = null;
      setStatusData(data);
      return data;
    });
    CACHE_PENDING[scope] = promise;
  }, [scope]);

  const match = statusData?.find((s) => s.value === staId);
  const resolvedLabel = label ?? match?.label ?? '';
  const resolvedColor = colorMap
    ? (colorMap[staId] ?? match?.sta_color ?? 'default')
    : (match?.sta_color ?? 'default');

  return (
    <Chip
      label={resolvedLabel}
      color={resolvedColor}
      size="small"
    />
  );
}

StatusChip.propTypes = {
  staId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string,
  scope: PropTypes.string,
  colorMap: PropTypes.objectOf(PropTypes.string),
};