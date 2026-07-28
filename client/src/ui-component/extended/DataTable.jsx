import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

import TableActions from './TableActions';
import ConfirmDialog from './ConfirmDialog';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
export default function DataTable({
  columns,
  rows,
  total = 0,
  loading = false,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  sortField,
  sortOrder = 1,
  onSort,
  keyExtractor = (row) => row?.id ?? row?.invId,
  emptyMessage = 'Sin resultados',
  loadingMessage = 'Cargando…',
  cardTitleRender,
  actions,
  footerRender,
  selectedRows,
  onSelectionChange,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [confirmItem, setConfirmItem] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const isSelectionEnabled = Array.isArray(selectedRows) && onSelectionChange;

  const selectedKeys = useMemo(
    () => isSelectionEnabled ? new Set(selectedRows.map((r) => keyExtractor(r))) : new Set(),
    [selectedRows, isSelectionEnabled, keyExtractor]
  );

  const allSelected = isSelectionEnabled && rows.length > 0 && rows.every((row) => selectedKeys.has(keyExtractor(row)));
  const someSelected = isSelectionEnabled && rows.some((row) => selectedKeys.has(keyExtractor(row)));

  const handleToggleAll = () => {
    if (allSelected) {
      const pageKeys = new Set(rows.map((r) => keyExtractor(r)));
      onSelectionChange(selectedRows.filter((r) => !pageKeys.has(keyExtractor(r))));
    } else {
      const existing = new Set(selectedRows.map((r) => keyExtractor(r)));
      const toAdd = rows.filter((r) => !existing.has(keyExtractor(r)));
      onSelectionChange([...selectedRows, ...toAdd]);
    }
  };

  const handleToggleRow = (row) => {
    const key = keyExtractor(row);
    if (selectedKeys.has(key)) {
      onSelectionChange(selectedRows.filter((r) => keyExtractor(r) !== key));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const handleConfirmAction = async () => {
    setConfirmLoading(true);
    try {
      await confirmItem?.command?.();
    } finally {
      setConfirmLoading(false);
      setConfirmItem(null);
    }
  };

const renderInlineActions = (row) => {
    const actionItems = actions(row);

    return actionItems.map((item, i) => {
      return (
        <Tooltip key={i} title={item.label} arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              if (item.confirm) {
                setConfirmItem(item);
              } else {
                item.command?.();
              }
            }}
            disabled={item.disabled}
            sx={{ bgcolor: item.color, color: 'white', minWidth: 0, '&:hover': { bgcolor: item.color } }}
          >
            {item.icon}
          </IconButton>
        </Tooltip>
      );
    });
  };

  const allColumns = useMemo(() => {
    if (!actions) return columns;
    return [
      ...columns,
      {
        id: '__actions__',
        label: 'Acciones',
        align: 'center',
        cardFooter: true,
        render: (row) => {
          const actionItems = actions(row);
          return actionItems.length < 3 ? (
            <Stack direction="row" spacing={0.5} justifyContent="center">
              {renderInlineActions(row)}
            </Stack>
          ) : (
            <TableActions items={actionItems} />
          );
        },
      },
    ];
  }, [columns, actions]);


  const visibleColumns = allColumns.filter((col) =>
    isMobile ? !col.hideInCard : !col.hideInTable
  );

  const getCellValue = (row, col, index) => {
    if (isMobile) {
      return col.cardRender?.(row, index) ?? col.render?.(row, index) ?? row[col.id] ?? '-';
    }
    return col.tableRender?.(row, index) ?? col.render?.(row, index) ?? row[col.id] ?? '-';
  };

  const renderPagination = () =>
    total > 0 && (
      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Filas:"
      />
    );

  if (isMobile) {
    const cardFields = visibleColumns.filter((col) => !col.cardFooter);
    const cardActionsList = visibleColumns.filter((col) => col.cardFooter);

    return (
      <>
        <Stack spacing={1.5}>
          {loading ? (
            <Card variant="outlined">
              <CardContent>
                <Typography align="center" color="text.secondary">
                  {loadingMessage}
                </Typography>
              </CardContent>
            </Card>
          ) : rows.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography align="center" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            rows.map((row, index) => (
              <Card key={keyExtractor(row)} variant="outlined">
                <CardContent sx={{ '&:last-child': { pb: cardActionsList.length ? 1.5 : 2 } }}>
                  {cardTitleRender && (
                    <>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {cardTitleRender(row)}
                      </Typography>
                      <Divider sx={{ mb: 1.5, mt: 0.5 }} />
                    </>
                  )}
                  <Stack spacing={1}>
                    {cardFields.map((col) => (
                      <Box key={col.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}
                        >
                          {col.label}:
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ flex: 1 }}>
                          {getCellValue(row, col, index)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
                {cardActionsList.length > 0 && (
                  <>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'center', py: 1 }}>
                      {cardActionsList.map((col) => {
                        if (col.id === '__actions__' && actions) {
                          const actionItems = actions(row);
                          const showOnlyIcons = actionItems.length > 3;
                          
                          if (showOnlyIcons) {
                            return actionItems.map((item, i) => (
                              <Tooltip key={i} title={item.label} arrow>
                                <IconButton
                                  size="lg"
                                  variant="contained"
                                  startIcon={item.icon}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.confirm) {
                                      setConfirmItem(item);
                                    } else {
                                      item.command?.();
                                    }
                                  }}
                                  disabled={item.disabled}
                                  sx={{ bgcolor: item.color ?? 'inherit', color: 'white', minWidth: 0 }}
                                >
                                  {item.icon}
                                </IconButton>
                              </Tooltip>
                            ));
                          }

                          return actionItems.map((item, i) => (
                            <span key={i}>
                                <Tooltip key={i} title={item.label} arrow>
                                <Button
                                  size="lg"
                                  variant="contained"
                                  startIcon={showOnlyIcons ? item.icon : null}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.confirm) {
                                      setConfirmItem(item);
                                    } else {
                                      item.command?.();
                                    }
                                  }}
                                  disabled={item.disabled}
                                  sx={{ bgcolor: item.color ?? 'inherit', color: 'white', minWidth: 0 }}
                                >
                                  {item.label}
                                </Button>
                            </Tooltip>
                              </span>
                          ));
                        }
                        return <Box key={col.id}>{getCellValue(row, col, index)}</Box>;
                      })}
                    </CardActions>
                  </>
                )}
              </Card>
              ))
            )}
            {footerRender && !loading && rows.length > 0 && (
              <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  {footerRender(rows, visibleColumns)}
                </CardContent>
              </Card>
            )}
          </Stack>
          {renderPagination()}
          <ConfirmDialog
            open={!!confirmItem}
            onClose={() => { if (!confirmLoading) setConfirmItem(null); }}
            onConfirm={handleConfirmAction}
            title={confirmItem?.confirmTitle || 'Confirmar'}
            message={confirmItem?.confirm || '¿Está seguro de realizar esta acción?'}
            confirmLabel={confirmItem?.confirmLabel || 'Eliminar'}
            confirmColor={confirmItem?.confirmColor || 'error'}
            loading={confirmLoading}
          />
      </>
    );
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {isSelectionEnabled && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someSelected && !allSelected}
                    checked={allSelected}
                    onChange={handleToggleAll}
                    size="small"
                  />
                </TableCell>
              )}
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{ whiteSpace: 'nowrap', ...(col.width ? { width: col.width } : {}) }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortField === col.id}
                      direction={sortOrder === 1 ? 'asc' : 'desc'}
                      onClick={() => onSort?.(col.id)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={(isSelectionEnabled ? 1 : 0) + visibleColumns.length} align="center">
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={(isSelectionEnabled ? 1 : 0) + visibleColumns.length} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={keyExtractor(row)}
                  hover
                  selected={isSelectionEnabled && selectedKeys.has(keyExtractor(row))}
                >
                  {isSelectionEnabled && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedKeys.has(keyExtractor(row))}
                        onChange={() => handleToggleRow(row)}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {getCellValue(row, col, index)}
                    </TableCell>
                  ))}
                </TableRow>
              )))}
            </TableBody>
            {footerRender && !loading && rows.length > 0 && (
              <tfoot>
                {footerRender(rows, visibleColumns)}
              </tfoot>
            )}
          </Table>
        </TableContainer>
      {renderPagination()}
      <ConfirmDialog
        open={!!confirmItem}
        onClose={() => { if (!confirmLoading) setConfirmItem(null); }}
        onConfirm={handleConfirmAction}
        title={confirmItem?.confirmTitle || 'Confirmar'}
        message={confirmItem?.confirm || '¿Está seguro de realizar esta acción?'}
        confirmLabel={confirmItem?.confirmLabel || 'Eliminar'}
        confirmColor={confirmItem?.confirmColor || 'error'}
        loading={confirmLoading}
      />
    </>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      sortable: PropTypes.bool,
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      hideInCard: PropTypes.bool,
      hideInTable: PropTypes.bool,
      cardFooter: PropTypes.bool,
      render: PropTypes.func,
      cardRender: PropTypes.func,
      tableRender: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  total: PropTypes.number,
  loading: PropTypes.bool,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
  sortField: PropTypes.string,
  sortOrder: PropTypes.oneOf([1, -1]),
  onSort: PropTypes.func,
  keyExtractor: PropTypes.func,
  emptyMessage: PropTypes.string,
  loadingMessage: PropTypes.string,
  cardTitleRender: PropTypes.func,
  actions: PropTypes.func,
  footerRender: PropTypes.func,
  selectedRows: PropTypes.array,
  onSelectionChange: PropTypes.func,
};
