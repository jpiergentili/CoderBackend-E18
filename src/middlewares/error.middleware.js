import EErros from "../services/errors/enums.js";
import logger from '../logger.js'

export default (error, req, res, next) => {
    logger.error(error);

    switch (error.code) {
        case EErros.ROUTING_ERROR:
            logger.error({message: error.message})
            res.status(404).json({ status: 'error', error: error.message });
            break;
        case EErros.INVALID_TYPES_ERROR:
            logger.error({message: error.message})
            res.status(400).json({ status: 'error', error: error.message });
            break;
        case EErros.DATABASE_ERROR:
            logger.error({message: error.message})
            res.status(500).json({ status: 'error', error: error.message });
            break;
        default:
            logger.error({message: 'Error no manejado'})
            res.status(500).json({ status: 'error', error: 'Error no manejado' });
            break;
    }
}
