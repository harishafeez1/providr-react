import clsx from 'clsx';
import {
  Premises,
  ProfileCard,
  ServiceArea,
  Specialisations,
  AccessMethods,
  AgeGroups,
  Services,
  Overview,
  Comments,
  ModelReview
} from './blocks';
import { Tags } from './blocks/Tags';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const ProfileCompanyContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7.5">
          <div className="col-span-1">
            <div className="flex flex-col gap-5 lg:gap-7.5">
              <div className={clsx('card')}>
                <span className="badge badge-sm badge-warning badge-outline">
                  Comming Soon!!! :)
                </span>
                <div className="card-body">
                  <div className="flex flex-wrap gap-2.5 m-2">
                    <button
                      className="btn btn-light flex justify-center grow"
                      onClick={() => handleModalOpen()}
                      disabled
                    >
                      Write a Review
                    </button>
                    <button
                      className="btn btn-light flex justify-center grow"
                      onClick={() => handleModalOpen()}
                      disabled
                    >
                      Endorse this provider
                    </button>
                  </div>
                </div>
              </div>
              <Link
                to="/company-profile/add-profile"
                className="btn btn-light flex justify-center grow"
              >
                Edit Your Profile
              </Link>
              <Tags title="Languages" />
              <ServiceArea title="Service Area" />
              {/* <Specialisations title="Specialisations" /> */}
              <AccessMethods title="Access Methods" />
              <AgeGroups title="Age Groups" />
            </div>
          </div>
          <div className="col-span-1 lg:col-span-2">
            <div className="flex flex-col gap-5 lg:gap-7.5">
              <ProfileCard />
              <Services />
              <Overview />
              <Premises />
              <Comments />
            </div>
          </div>
        </div>
      </div>
      <ModelReview
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSaveConfirm={async () => {
          handleModalClose();
        }}
      />
    </>
  );
};

export { ProfileCompanyContent };
