import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DataGrid,
  DataGridColumnHeader,
  KeenIcon,
  Menu,
  MenuIcon,
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuToggle,
  TDataGridRequestParams
} from '@/components';
import { ColumnDef, Column, RowSelectionState } from '@tanstack/react-table';

import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { IReviewsData } from './';
import { useAuthContext } from '@/auth';
import { getAllReviews, replyToReview, updateReply, deleteReply } from '@/services/api/reviews';
import { format } from 'date-fns';
import { CommonRating } from '@/partials/common';
import { useLanguage } from '@/i18n';
import { Badge } from '@/components/ui/badge';

interface IColumnFilterProps<TData, TValue> {
  column: Column<TData, TValue>;
}

const DropdownCard2 = (
  row: any,
  setRefreshKey: any,
  onReplyClick: (review: IReviewsData) => void,
  onEditReplyClick: (review: IReviewsData) => void,
  onDeleteReplyClick: (review: IReviewsData) => void
) => {
  const { isRTL } = useLanguage();

  const handleReplyClick = () => {
    onReplyClick(row);
  };

  const handleEditReplyClick = () => {
    onEditReplyClick(row);
  };

  const handleDeleteReplyClick = () => {
    onDeleteReplyClick(row);
  };

  const hasReply = row.reply && row.reply.content;

  return (
    <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
      {!hasReply && (
        <MenuItem
          onClick={handleReplyClick}
          toggle="dropdown"
          dropdownProps={{
            placement: isRTL() ? 'left-start' : 'right-start',
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: isRTL() ? [15, 0] : [-15, 0] // [skid, distance]
                }
              }
            ]
          }}
        >
          <MenuLink>
            <a className="flex">
              <MenuIcon>
                <KeenIcon icon="notepad-edit" />
              </MenuIcon>
              <MenuTitle>{'Reply'}</MenuTitle>
            </a>
          </MenuLink>
        </MenuItem>
      )}

      {hasReply && (
        <>
          <MenuItem
            onClick={handleEditReplyClick}
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? 'left-start' : 'right-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [15, 0] : [-15, 0] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuLink>
              <a className="flex">
                <MenuIcon>
                  <KeenIcon icon="pencil" />
                </MenuIcon>
                <MenuTitle>{'Edit Reply'}</MenuTitle>
              </a>
            </MenuLink>
          </MenuItem>

          <MenuItem
            onClick={handleDeleteReplyClick}
            toggle="dropdown"
            dropdownProps={{
              placement: isRTL() ? 'left-start' : 'right-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [15, 0] : [-15, 0] // [skid, distance]
                  }
                }
              ]
            }}
          >
            <MenuLink>
              <a className="flex">
                <MenuIcon>
                  <KeenIcon icon="trash" />
                </MenuIcon>
                <MenuTitle>{'Delete Reply'}</MenuTitle>
              </a>
            </MenuLink>
          </MenuItem>
        </>
      )}
    </MenuSub>
  );
};

const ReviewsTable = () => {
  const { currentUser } = useAuthContext();
  const { isRTL } = useLanguage();

  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<IReviewsData | null>(null);
  const [replyText, setReplyText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<IReviewsData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewContent, setViewContent] = useState({ title: '', content: '' });

  const handleReplyClick = (review: IReviewsData) => {
    setSelectedReview(review);
    setReplyText('');
    setIsEditMode(false);
    setIsReplyDialogOpen(true);
  };

  const handleEditReplyClick = (review: IReviewsData) => {
    setSelectedReview(review);
    setReplyText(review.reply?.content || '');
    setIsEditMode(true);
    setIsReplyDialogOpen(true);
  };

  const handleDeleteReplyClick = (review: IReviewsData) => {
    setReviewToDelete(review);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete?.reply?.id) return;

    try {
      await deleteReply(reviewToDelete.reply.id);
      setRefreshKey((prev) => prev + 1);
      setIsDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const handleViewMore = (title: string, content: string) => {
    setViewContent({ title, content });
    setIsViewModalOpen(true);
  };

  const TruncatedText = ({ text, title }: { text: string; title: string }) => {
    const lines = text.split('\n');
    const shouldTruncate = lines.length > 3 || text.length > 150;

    if (!shouldTruncate) {
      return <span className="text-gray-800 font-normal">{text}</span>;
    }

    const truncatedText = lines.slice(0, 3).join('\n');
    const displayText =
      truncatedText.length > 150 ? truncatedText.substring(0, 150) + '...' : truncatedText;

    return (
      <div className="space-y-2">
        <span className="text-gray-800 font-normal block">
          {displayText}
          {lines.length > 3 && '...'}
        </span>
        <button
          onClick={() => handleViewMore(title, text)}
          className="text-primary text-sm font-medium hover:text-primary-active underline"
        >
          View more
        </button>
      </div>
    );
  };

  const handleCloseDialog = () => {
    setIsReplyDialogOpen(false);
    setSelectedReview(null);
    setReplyText('');
    setIsEditMode(false);
  };

  const handleReplySubmit = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      if (isEditMode && selectedReview.reply?.id) {
        await updateReply(selectedReview.reply.id, replyText.trim());
      } else {
        await replyToReview(selectedReview.id, replyText.trim());
      }
      handleCloseDialog();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'submit'} reply. Please try again.`);
    }
  };

  const getWordCount = (text: string) => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  const wordCount = getWordCount(replyText);
  const isOverLimit = wordCount > 180;

  const ColumnInputFilter = <TData, TValue>({ column }: IColumnFilterProps<TData, TValue>) => {
    return (
      <Input
        placeholder="Filter..."
        value={(column.getFilterValue() as string) ?? ''}
        onChange={(event) => column.setFilterValue(event.target.value)}
        className="h-9 w-full max-w-40"
      />
    );
  };

  const fetchAllReviews = async (params: TDataGridRequestParams) => {
    if (!currentUser) {
      console.error('currentUser is undefined');
      return {
        data: [],
        totalCount: 0
      };
    }
    try {
      const queryParams = new URLSearchParams();

      queryParams.set('page', String(params.pageIndex + 1));
      queryParams.set('per_page', String(params.pageSize));
      if (params.sorting?.[0]?.id) {
        queryParams.set('sort', params.sorting[0].id);
        queryParams.set('order', params.sorting[0].desc ? 'desc' : 'asc');
      }

      // if (searchQuery.trim().length > 0) {
      //   queryParams.set('query', searchQuery);
      // }

      if (params.columnFilters) {
        params.columnFilters.forEach(({ id, value }) => {
          if (value !== undefined && value !== null) {
            queryParams.set(`filter[${id}]`, String(value));
          }
        });
      }

      const response = await getAllReviews(
        `${currentUser.provider_company_id}?${queryParams.toString()}`
      );

      return {
        data: response.data,
        totalCount: response.total
      };
    } catch (error) {
      console.error(error);

      return {
        data: [],
        totalCount: 0
      };
    }
  };

  const columns = useMemo<ColumnDef<IReviewsData>[]>(
    () => [
      {
        accessorFn: (row) => row.rating,
        id: 'rating',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Rating "
            column={column}
            icon={<i className="ki-filled ki-graph-3"></i>}
          />
        ),
        cell: (info) => {
          return (
            <span>
              {info.row.original.rating && (
                <CommonRating rating={info.row.original.rating as number} />
              )}
            </span>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.customer_id,
        id: 'customer_id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Author"
            column={column}
            icon={<i className="ki-filled ki-text"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {`${info.row.original?.customer?.first_name ?? ''} ${info.row.original?.customer?.last_name ?? ''}`.trim()}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },

      {
        accessorFn: (row) => row.service_offering_id,
        id: 'service_offering_id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Reviewed Item"
            column={column}
            icon={<i className="ki-filled ki-archive-tick"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center text-gray-800 font-normal gap-1.5">
              {info.row.original?.service_offering?.service?.name || ''}
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row) => row.content,
        id: 'content',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Review"
            column={column}
            icon={<i className="ki-filled ki-element-1"></i>}
          />
        ),
        cell: (info) => {
          return (
            <div className="flex items-center gap-1.5">
              <TruncatedText text={info.row.original.content || ''} title="Review Content" />
            </div>
          );
        },
        meta: {
          headerClassName: 'min-w-[180px]'
        }
      },
      {
        accessorFn: (row: IReviewsData) => row.id,
        id: 'reply',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Reply"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-time"></i>}
          />
        ),
        cell: ({ row }) => {
          const replyContent = row.original?.reply?.content ?? '';
          return (
            <div className="flex items-center gap-4">
              {replyContent ? (
                <TruncatedText text={replyContent} title="Reply Content" />
              ) : (
                <span className="text-gray-400 italic">No reply</span>
              )}
            </div>
          );
        },
        meta: {
          className: 'min-w-[300px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },
      {
        accessorFn: (row: IReviewsData) => row.id,
        id: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader
            filterable={false}
            title="Date Added"
            filter={<ColumnInputFilter column={column} />}
            column={column}
            icon={<i className="ki-filled ki-time"></i>}
          />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-0.5">
                <div className="text-2sm text-gray-700 font-normal">
                  {row.original.created_at ? format(row.original.created_at, 'LLL dd, y') : ''}
                </div>
              </div>
            </div>
          );
        },
        meta: {
          className: 'min-w-[300px]',
          cellClassName: 'text-gray-800 font-normal'
        }
      },

      {
        id: 'click',
        header: () => '',
        enableSorting: false,
        cell: (info) => (
          <Menu className="items-stretch">
            <MenuItem
              toggle="dropdown"
              trigger="click"
              dropdownProps={{
                placement: isRTL() ? 'bottom-start' : 'bottom-end',
                modifiers: [
                  {
                    name: 'offset',
                    options: {
                      offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
                    }
                  }
                ]
              }}
            >
              <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                <KeenIcon icon="dots-vertical" />
              </MenuToggle>
              {DropdownCard2(
                info.row.original,
                setRefreshKey,
                handleReplyClick,
                handleEditReplyClick,
                handleDeleteReplyClick
              )}
            </MenuItem>
          </Menu>
        ),
        meta: {
          headerClassName: 'w-[60px]'
        }
      }
    ],
    []
  );

  const handleRowSelection = (state: RowSelectionState) => {
    const selectedRowIds = Object.keys(state);
    if (selectedRowIds.length > 0) {
      toast(`Total ${selectedRowIds.length} are selected.`, {
        description: `Selected row IDs: ${selectedRowIds}`,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo')
        }
      });
    }
  };
  const Toolbar = () => {
    return (
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Reviews</h3>

        {/* <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex gap-6">
            <div className="relative">
              <KeenIcon
                icon="magnifier"
                className="leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3"
              />
              <input
                type="text"
                placeholder="Search Review"
                className="input input-sm ps-8"
                value={''}
                onChange={() => {}}
              />
            </div>
          </div>
        </div> */}
      </div>
    );
  };
  return (
    <>
      <DataGrid
        serverSide={true}
        columns={columns}
        onFetchData={fetchAllReviews}
        rowSelection={true}
        onRowSelectionChange={handleRowSelection}
        pagination={{ size: 5 }}
        toolbar={<Toolbar />}
        layout={{ card: true }}
        key={refreshKey}
      />

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Reply' : 'Reply to Review'}</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-4">
            {selectedReview && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <CommonRating rating={selectedReview.rating as number} />
                  <span className="text-sm text-gray-600">
                    by{' '}
                    {`${selectedReview.customer?.first_name ?? ''} ${selectedReview.customer?.last_name ?? ''}`.trim()}
                  </span>
                </div>
                <p className="text-gray-800 text-sm">{selectedReview.content}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {selectedReview.created_at ? format(selectedReview.created_at, 'LLL dd, y') : ''}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {isEditMode ? 'Edit Your Reply' : 'Your Reply'}
              </label>
              <Textarea
                placeholder={isEditMode ? 'Edit your reply here...' : 'Type your reply here...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={`min-h-[120px] ${isOverLimit ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between items-center text-xs">
                <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  {wordCount}/180 words
                </span>
                {isOverLimit && <span className="text-red-500">Word limit exceeded</span>}
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-end gap-2">
            <button type="button" onClick={handleCloseDialog} className="btn btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReplySubmit}
              disabled={!replyText.trim() || isOverLimit}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditMode ? 'Update Reply' : 'Submit Reply'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Reply</DialogTitle>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <KeenIcon icon="warning-2" className="text-warning text-2xl" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Are you sure you want to delete this reply?
                  </p>
                  <p className="text-gray-600 text-sm mt-1">This action cannot be undone.</p>
                </div>
              </div>

              {reviewToDelete && (
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm text-gray-700 font-medium mb-1">Your reply:</p>
                  <p className="text-sm text-gray-600 italic">"{reviewToDelete.reply?.content}"</p>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-end gap-2">
            <button type="button" onClick={handleCancelDelete} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={handleConfirmDelete} className="btn btn-danger">
              Delete Reply
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{viewContent.title}</DialogTitle>
          </DialogHeader>

          <DialogBody className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-gray-800 font-normal text-sm leading-relaxed">
                  {viewContent.content}
                </pre>
              </div>
            </div>
          </DialogBody>

          <DialogFooter className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ReviewsTable };
