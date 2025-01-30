import { Fragment, useState } from 'react';

import { KeenIcon } from '@/components';

interface IPlanPrice {
  regular: string;
  annual?: string;
}

interface IPlanInfo {
  title: string;
  description: string;
  free?: boolean;
  price?: IPlanPrice;
}

interface IFeaturePlans {
  basic: { value?: string; status: boolean };
  pro: { value?: string; status: boolean };
  premium: { value?: string; status?: boolean };
}

interface IFeature {
  title: string;
  plans: IFeaturePlans;
}

interface IPlansInfo {
  basic: IPlanInfo;
  pro: IPlanInfo;
  premium: IPlanInfo;
}

interface IPlansItem {
  title: string;
  plans: IFeaturePlans;
}

interface IPlansItems {
  info: IPlansInfo;
  features: IFeature[];
}

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const handleToggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const plans: IPlansItems = {
    info: {
      basic: {
        title: 'Starter',
        description:
          'Get started with finding NDIS participants with population coverage targeting of approximately 1 to 5 million.',
        price: {
          regular: '$83',
          annual: '$59'
        }
      },
      pro: {
        title: 'Accreditation Plus',
        description:
          'Perfect for growing NDIS businesses with population coverage targeting of around 5 to 10 million & advanced endorsement options.',
        price: {
          regular: '$149',
          annual: '$109'
        }
      },
      premium: {
        title: 'Enterprise',
        description: 'Nationwide coverage and unlimited access to all platform features.',
        price: {
          regular: '$499',
          annual: '$333'
        }
      }
    },
    features: [
      {
        title: 'service requests per month',
        plans: {
          basic: { value: 'Up to 3 service requests per month ', status: true },
          pro: { value: 'Up to 5 service requests per month ', status: true },
          premium: { value: 'Unlimited service requests per month ', status: true }
        }
      },
      {
        title: 'Advertise',
        plans: {
          basic: { value: 'Advertise Up to 3 Services ', status: true },
          pro: { value: 'Advertise Up to 5 Services', status: true },
          premium: { value: 'Advertise all your Services ', status: true }
        }
      },
      {
        title: 'row3',
        plans: {
          basic: { value: 'Accreditation badge ', status: true },
          pro: {
            value: 'Prominent map placement with pin at the top of the directory',
            status: true
          },
          premium: {
            value: 'Everything in plus including map, gallery, larger directory listing ',
            status: true
          }
        }
      },
      {
        title: 'row4',
        plans: {
          basic: {
            value: 'Connect via direct connect button, social & web links only',
            status: true
          },
          pro: {
            value: 'Larger prioritised directory listing with NDIS & Accreditation badging',
            status: true
          },
          premium: {
            value: 'Connect via phone, direct connect button social & SEO friendly web link ',
            status: true
          }
        }
      },
      {
        title: 'row5',
        plans: {
          basic: {
            value: 'Phone number shown',
            status: false
          },
          pro: { value: 'Enhanced directory listing with Photo Gallery', status: true },
          premium: { value: 'Nationwide geolocation targeting ', status: true }
        }
      },
      {
        title: 'row6',
        plans: {
          basic: {
            value: 'Map placement with pin',
            status: false
          },
          pro: {
            value: 'Connect via phone, direct connect button social & SEO friendly web link',
            status: true
          },
          premium: {}
        }
      },
      {
        title: 'row7',
        plans: {
          basic: {
            value: 'Smaller geographic targeting',
            status: false
          },
          pro: { value: 'Larger geolocation targeting', status: true },
          premium: {}
        }
      },
      {
        title: 'row8',
        plans: {
          basic: {
            status: false
          },
          pro: { value: 'Nationwide coverage & unlimited services', status: false },
          premium: {}
        }
      }
    ]
  };

  const renderPlanInfo = (type: string, info: IPlanInfo) => (
    <Fragment>
      <h3 className="text-lg text-gray-900 font-medium pb-2">{info.title}</h3>
      <div className="text-gray-700 text-2sm">{info.description}</div>
      <div className="py-4">
        <div className="flex items-end gap-1.5" data-plan-type={type}>
          {' '}
          <div
            className="text-2xl text-gray-900 font-semibold leading-none"
            data-plan-price-regular={info.price?.regular}
            data-plan-price-annual={info.price?.annual}
          >
            {isAnnual ? info.price?.regular : info.price?.annual}
          </div>
          <div className="text-gray-700 text-2xs">{isAnnual ? 'per month' : 'per year'}</div>
        </div>
      </div>
      {!info.free && (
        <div>
          <button
            className={
              info.free
                ? 'btn btn-light btn-sm flex justify-center w-full'
                : 'btn btn-primary btn-sm text-center flex justify-center w-full'
            }
          >
            {!info.free && 'Upgrade'}
          </button>
        </div>
      )}
    </Fragment>
  );

  const renderFeatureDetail = (detail: { value?: string; status?: boolean }) => {
    return (
      <div className="text-gray-800 text-2sm">
        {detail.value && (
          <>
            {detail.status ? (
              <KeenIcon icon="check" className="text-success text-lg" />
            ) : (
              <KeenIcon icon="cross" className="text-danger text-lg" />
            )}{' '}
            {detail.value}
          </>
        )}
      </div>
    );
  };

  const renderItem = (feature: IPlansItem, index: number) => {
    return (
      <tr key={index}>
        <td className="table-border-s !px-5 !py-3.5">
          <div className="text-gray-800 text-2sm">{renderFeatureDetail(feature.plans.basic)}</div>
        </td>
        <td className="table-border-s !px-5 !py-3.5">{renderFeatureDetail(feature.plans.pro)}</td>
        <td className="table-border-s !px-5 !py-3.5">
          {renderFeatureDetail(feature.plans.premium)}
        </td>
      </tr>
    );
  };

  return (
    <div className="card scrollable-x-auto">
      <label className="switch switch-sm p-4">
        <input
          className="order-1"
          type="checkbox"
          checked={isAnnual}
          onChange={handleToggleBilling}
        />
        <div className="switch-label order-2">
          <span className="text-gray-800 text-2sm font-semibold">
            {isAnnual ? 'Annual Billing' : 'Quarterly Billing'}
          </span>
        </div>
      </label>
      <table
        className="table card table-fixed min-w-[1000px] table-border-b table-border-e
     "
      >
        <tbody>
          <tr>
            <td className="!border-b-0 table-border-s  bg-light-active dark:bg-coal-100 !p-5 !pt-7.5 relative">
              <span className="absolute badge badge-sm badge-outline badge-success absolutes top-0 start-1/2 rtl:translate-x-1/2 -translate-x-1/2 -translate-y-1/2">
                Current Plan
              </span>
              {renderPlanInfo('basic', plans.info.basic)}
            </td>
            <td className="!border-b-0 table-border-s table-border-t !p-5 !pt-7.5">
              {renderPlanInfo('pro', plans.info.pro)}
            </td>
            <td className="!border-b-0 table-border-s table-border-t !p-5 !pt-7.5">
              {renderPlanInfo('premium', plans.info.premium)}
            </td>
          </tr>

          {plans.features.map((feature: IPlansItem, index: number) => renderItem(feature, index))}
        </tbody>
      </table>
    </div>
  );
};

export { Plans, type IPlansItem, type IPlansItems };
