import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeamModal from './CreateTeamModal';

export default function TeamCreate() {
  const navigate = useNavigate();

  return (
    <CreateTeamModal
      onClose={() => navigate('/teams')}
    />
  );
}