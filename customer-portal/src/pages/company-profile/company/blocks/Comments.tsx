import { useState } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';

interface ICommentsItem {
  avatar: string;
  author: string;
  date: string;
  text: string;
}

interface ICommentsProps {
  items: ICommentsItem[];
}
interface ICommentsItems extends Array<ICommentsItem> {}

const Comments = () => {
  const [commentInput, setCommentInput] = useState('');
  const featureActive = false;
  const items: ICommentsItems = [
    {
      avatar: '300-3.png',
      author: 'Mr. Anderson',
      date: '1 Day ago',
      text: 'Long before you sit dow to put digital pen to paper you need to make sure you have to sit down and write. I’ll show you how to write a great blog post in five simple steps that people will actually want to read. Ready?'
    },
    {
      avatar: '300-15.png',
      author: 'Mrs. Anderson',
      date: '1 Day ago',
      text: 'Long before you sit dow to put digital pen to paper.'
    }
  ];
  const renderItem = (item: ICommentsItem, index: number) => {
    return (
      <div key={index} className="flex items-start gap-2.5">
        <img
          src={toAbsoluteUrl(`/media/avatars/${item.avatar}`)}
          className="rounded-full w-9 h-9 lg:w-[50px] lg:h-[50px] mt-1"
          alt=""
        />

        <div className="grid gap-2.5 grow">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <a href="#" className="text-md font-medium text-gray-900 hover:text-primary-active">
                {item.author}
              </a>
              <span className="text-sm text-gray-700">{item.date}</span>
            </div>
          </div>

          <p className="text-sm text-gray-800 heading-5.5">{item.text}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {featureActive ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Reviews</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-2.5">
              <div className="grid gap-2 lg:gap-5 pt-0">
                {items.map((item, index) => {
                  return renderItem(item, index);
                })}

                <div className="flex items-center gap-2.5">
                  <img
                    src={toAbsoluteUrl('/media/avatars/300-3.png')}
                    className="rounded-full size-10 shrink-0"
                    alt=""
                  />
                  <div className="input input-lg">
                    <input
                      type="text"
                      placeholder="your review.."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Reviews</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-col gap-2.5">
              <span className="badge badge-sm badge-warning badge-outline">Comming Soon!!! :)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { Comments, type ICommentsProps };
