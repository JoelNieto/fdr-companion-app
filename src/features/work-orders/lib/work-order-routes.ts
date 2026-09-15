/** Path for work-order detail. trailingSlash: true requires the slash before `?`. */
export function workOrderDetailHref(workOrderId: string): string {
  return `/work-orders/detail/?id=${encodeURIComponent(workOrderId)}`;
}
