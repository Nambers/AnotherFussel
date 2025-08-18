#!/bin/bash
export VIPS_CONCURRENCY=$(( $(nproc) - 1 ))
# gatsby build
pnpm run build
