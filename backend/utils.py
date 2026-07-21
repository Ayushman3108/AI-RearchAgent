import logging


def setup_logger():
    """
    Initializes standard runtime execution system logging.
    """
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler()],
    )
    return logging.getLogger("ReportWriterAgent")


logger = setup_logger()
