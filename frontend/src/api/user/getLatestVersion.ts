import { ErrorResponseHandler } from 'api/ErrorResponseHandler';
import axios, { AxiosError } from 'axios';
import { ErrorResponse, SuccessResponse } from 'types/api';
import { PayloadProps } from 'types/api/user/getLatestVersion';
import { getVersion } from 'constants/api';

const getLatestVersion = async (): Promise<
	SuccessResponse<PayloadProps> | ErrorResponse
> => {
	try {
		const response = await axios.get(`/${getVersion}`);

		return {
			statusCode: 200,
			error: null,
			message: response.data.status,
			payload: response.data,
		};
	} catch (error) {
		return ErrorResponseHandler(error as AxiosError);
	}
};

export default getLatestVersion;
