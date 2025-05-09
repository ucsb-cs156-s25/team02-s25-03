import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequests/HelpRequestForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function HelpRequestsCreatePage({ storybook = false }) {

  const addZ = (string) => `${string}Z`;


  const objectToAxiosParams = (helprequest) => ({
    url: "/api/helprequests/post",
    method: "POST",
    params: {
      requesterEmail: helprequest.requesterEmail,
      teamId: helprequest.teamId,
      tableOrBreakoutRoom: helprequest.tableOrBreakoutRoom,
      requestTime: addZ(helprequest.requestTime),
      explanation: helprequest.explanation,
      solved: helprequest.solved,
    },
  });

  const onSuccess = (helprequest) => {
    toast(
      `New restaurant Created - id: ${helprequest.id} requesterEmail: ${helprequest.requesterEmail} teamId: ${helprequest.teamId} tableOrBreakoutRoom: ${helprequest.tableOrBreakoutRoom} requestTime: ${helprequest.requestTime} explanation: ${helprequest.explanation} solved: ${helprequest.solved}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/helprequests/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/helprequests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New HelpRequest</h1>
        <HelpRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
