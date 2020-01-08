import os
import inspect
import importlib.util as imp
import logging
import sys



script_location = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'score.py')
driver_module_spec = imp.spec_from_file_location('service_driver', script_location)
driver_module = imp.module_from_spec(driver_module_spec)
driver_module_spec.loader.exec_module(driver_module)

if(True):
    formatter = logging.Formatter('%(asctime)s | %(name)s | %(levelname)s | %(message)s')
    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setLevel(logging.DEBUG)
    stream_handler.setFormatter(formatter)
    aml_logger = logging.getLogger('azureml')
    aml_logger.setLevel(logging.DEBUG)
    aml_logger.addHandler(stream_handler)

def run(http_body, request_headers):
    global run_supports_request_headers

    arguments = {run_input_parameter_name: http_body}
    if run_supports_request_headers:
        arguments["request_headers"] = request_headers

    return_obj = driver_module.run(**arguments)

    return return_obj


def init():
    global run_input_parameter_name
    global run_supports_request_headers

    run_args = inspect.signature(driver_module.run).parameters.keys()
    run_args_list = list(run_args)
    run_input_parameter_name = run_args_list[0] if run_args_list[0] != "request_headers" else run_args_list[1]
    run_supports_request_headers = "request_headers" in run_args_list

    driver_module.init()